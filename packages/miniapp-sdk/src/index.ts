/**
 * Tiny SDK for mini apps running inside the miniapps iframe host.
 *
 * Works identically whether loaded inside the host iframe or opened standalone
 * (standalone simply never receives wallet_connected, so the UI stays disconnected).
 */

export interface Transaction {
  to: string;
  data?: string;
  value?: string;
}

export interface SignResult {
  signature: string;
  verified: boolean;
}

/**
 * Controls how the host hashes the message before signing:
 *
 * - `'erc1271'` (default) — The host applies EIP-191 prefix-hashing to the message
 *   (`keccak256("\x19Ethereum Signed Message:\n" + len + message)`) and uses that
 *   hash as the `SafeMessage.message` content before signing with EIP-712.
 *   Verifiers must call `isValidSignature(eip191Hash, sig)`.
 *
 * - `'raw'` — The host encodes the message as raw UTF-8 bytes and uses those bytes
 *   directly as the `SafeMessage.message` content before signing with EIP-712.
 *   Verifiers must call `isValidSignature(rawBytes, sig)`.
 *
 * The two types produce different signatures that are not interchangeable.
 */
export type SignatureType = 'erc1271' | 'raw';

type WalletListener = (address: string | null) => void;
type DataListener = (data: string) => void;

interface PendingRequest<T> {
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
}

let _address: string | null = null;
const _listeners: WalletListener[] = [];
const _dataListeners: DataListener[] = [];
let _requestCounter = 0;
const _pending: Record<string, PendingRequest<unknown>> = {};

if (typeof window !== 'undefined') {
  window.addEventListener('message', (event: MessageEvent) => {
    const d = event.data as { type: string; [key: string]: unknown };
    if (!d || !d.type) return;

    switch (d.type) {
      case 'app_data':
        _dataListeners.forEach((fn) => fn(d.data as string));
        break;

      case 'wallet_connected':
        _address = d.address as string;
        _listeners.forEach((fn) => fn(_address));
        break;

      case 'wallet_disconnected':
        _address = null;
        _listeners.forEach((fn) => fn(null));
        break;

      case 'tx_success':
        (_pending[d.requestId as string] as PendingRequest<string[]>)?.resolve(d.hashes as string[]);
        delete _pending[d.requestId as string];
        break;

      case 'tx_rejected':
        _pending[d.requestId as string]?.reject(new Error((d.error ?? d.reason ?? 'Rejected') as string));
        delete _pending[d.requestId as string];
        break;

      case 'sign_success':
        (_pending[d.requestId as string] as PendingRequest<SignResult>)?.resolve({
          signature: d.signature as string,
          verified: d.verified as boolean,
        });
        delete _pending[d.requestId as string];
        break;

      case 'sign_rejected':
        _pending[d.requestId as string]?.reject(new Error((d.error ?? d.reason ?? 'Rejected') as string));
        delete _pending[d.requestId as string];
        break;
    }
  });

  // Ask the host for the current wallet state on load
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'request_address' }, '*');
  }
}

/**
 * Returns true when running inside the miniapps iframe host.
 */
export function isMiniappMode(): boolean {
  return typeof window !== 'undefined' && window.parent !== window;
}

/**
 * Register a callback that fires when the host sends app-specific data via ?data= param.
 */
export function onAppData(fn: DataListener): void {
  _dataListeners.push(fn);
}

/**
 * Register a callback that fires whenever wallet connection changes.
 * Called immediately with current state, then again on every change.
 * Returns an unsubscribe function.
 */
export function onWalletChange(fn: WalletListener): () => void {
  _listeners.push(fn);
  fn(_address);
  return () => {
    const idx = _listeners.indexOf(fn);
    if (idx !== -1) _listeners.splice(idx, 1);
  };
}

/**
 * Request the host to send one or more transactions.
 * @returns array of tx hashes
 */
export function sendTransactions(transactions: Transaction[]): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const requestId = 'req_' + ++_requestCounter;
    _pending[requestId] = { resolve: resolve as (value: unknown) => void, reject };
    window.parent.postMessage({ type: 'send_transactions', requestId, transactions }, '*');
  });
}

/**
 * Request the host to sign a message.
 *
 * @param message - The message string to sign.
 * @param signatureType - How the host hashes the message before signing. See {@link SignatureType}.
 *   Defaults to `'erc1271'`.
 * @returns `{ signature, verified }` on success.
 */
export function signMessage(message: string, signatureType: SignatureType = 'erc1271'): Promise<SignResult> {
  return new Promise((resolve, reject) => {
    const requestId = 'req_' + ++_requestCounter;
    _pending[requestId] = { resolve: resolve as (value: unknown) => void, reject };
    window.parent.postMessage({ type: 'sign_message', requestId, message, signatureType }, '*');
  });
}
