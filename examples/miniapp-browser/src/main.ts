import '../styles.css';

import { Sdk } from '@aboutcircles/sdk';
import { circlesConfig } from '@aboutcircles/sdk-core';
import { MiniAppPostMessageRunner } from '../../../packages/runner/src/miniapp-postmessage-runner';
import { gnosis } from 'viem/chains';

import { isMiniappMode, onWalletChange } from './miniapp-sdk';

const modeEl = document.getElementById('mode') as HTMLParagraphElement;
const readinessEl = document.getElementById('readiness') as HTMLParagraphElement;
const writeReadyEl = document.getElementById('writeReady') as HTMLParagraphElement;
const walletStatusEl = document.getElementById('walletStatus') as HTMLDivElement;

const loadMineBtnEl = document.getElementById('loadMineBtn') as HTMLButtonElement;
const queryAddressEl = document.getElementById('queryAddress') as HTMLInputElement;
const loadAddressBtnEl = document.getElementById('loadAddressBtn') as HTMLButtonElement;
const avatarSummaryEl = document.getElementById('avatarSummary') as HTMLParagraphElement;
const trustSummaryEl = document.getElementById('trustSummary') as HTMLParagraphElement;
const balanceSummaryEl = document.getElementById('balanceSummary') as HTMLParagraphElement;
const readResultEl = document.getElementById('readResult') as HTMLPreElement;

const receiveAddressEl = document.getElementById('receiveAddress') as HTMLElement;
const copyAddressBtnEl = document.getElementById('copyAddressBtn') as HTMLButtonElement;

const sendToEl = document.getElementById('sendTo') as HTMLInputElement;
const sendAmountEl = document.getElementById('sendAmount') as HTMLInputElement;
const sendBtnEl = document.getElementById('sendBtn') as HTMLButtonElement;

const messageInputEl = document.getElementById('messageInput') as HTMLTextAreaElement;
const signatureTypeEl = document.getElementById('signatureType') as HTMLSelectElement;
const signBtnEl = document.getElementById('signBtn') as HTMLButtonElement;

const trustTargetEl = document.getElementById('trustTarget') as HTMLInputElement;
const trustBtnEl = document.getElementById('trustBtn') as HTMLButtonElement;

const resultEl = document.getElementById('result') as HTMLPreElement;

let sdk: Sdk | undefined;
let runner: any;
let connectedAddress: `0x${string}` | null = null;

function toUiJson(value: unknown): string {
  return JSON.stringify(
    value,
    (_key, v) => (typeof v === 'bigint' ? v.toString() : v),
    2,
  );
}

function setResult(value: unknown): void {
  resultEl.textContent = toUiJson(value);
}

function setReadResult(value: unknown): void {
  readResultEl.textContent = toUiJson(value);
}

function isAddress(value: string | null | undefined): value is `0x${string}` {
  return /^0x[a-fA-F0-9]{40}$/.test(String(value ?? ''));
}

function formatAddress(value: string): string {
  if (!isAddress(value)) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

function formatCrcFromAtto(value: bigint): string {
  const base = 10n ** 18n;
  const whole = value / base;
  const frac = value % base;
  if (frac === 0n) return `${whole.toString()} CRC`;
  const fracStr = frac.toString().padStart(18, '0').slice(0, 4).replace(/0+$/, '');
  return `${whole.toString()}${fracStr ? `.${fracStr}` : ''} CRC`;
}

function formatCircles(value: number): string {
  const rounded = Number.isInteger(value) ? value.toString() : value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
  return `${rounded} Circles`;
}

function parseCrcToAtto(input: string): bigint {
  const trimmed = input.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error('Amount must be a number, e.g. 1 or 1.5');
  }

  const [wholeRaw, fractionRaw = ''] = trimmed.split('.');
  if (fractionRaw.length > 18) {
    throw new Error('Use up to 18 decimal places.');
  }

  const whole = BigInt(wholeRaw);
  const fraction = BigInt((fractionRaw + '0'.repeat(18)).slice(0, 18));
  const amount = whole * 10n ** 18n + fraction;

  if (amount <= 0n) {
    throw new Error('Amount must be greater than 0.');
  }

  return amount;
}

function getBalanceAttoValue(item: {
  attoCrc?: unknown;
  attoCircles?: unknown;
  amount?: unknown;
  balance?: unknown;
}): bigint {
  const candidates = [item.attoCrc, item.attoCircles, item.amount, item.balance];
  for (const value of candidates) {
    try {
      if (value !== undefined && value !== null) return BigInt(value);
    } catch {
      // try next candidate
    }
  }
  return 0n;
}

function getBalanceCirclesValue(item: {
  circles?: unknown;
  crc?: unknown;
  staticCircles?: unknown;
}): number {
  const candidates = [item.circles, item.crc, item.staticCircles];
  for (const value of candidates) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
}

function sumBalancesToCircles(
  balances: Array<{ circles?: unknown; crc?: unknown; staticCircles?: unknown }>,
): number {
  return balances.reduce((sum, item) => sum + getBalanceCirclesValue(item), 0);
}

function sumBalancesToAtto(
  balances: Array<{ attoCrc?: unknown; attoCircles?: unknown; amount?: unknown; balance?: unknown }>,
): bigint {
  let total = 0n;
  for (const item of balances) {
    total += getBalanceAttoValue(item);
  }
  return total;
}

function setModeBadge(): void {
  if (isMiniappMode()) {
    modeEl.textContent = 'Miniapp host detected';
    modeEl.className = 'pill ok';
  } else {
    modeEl.textContent = 'Standalone browser mode';
    modeEl.className = 'pill warn';
  }
}

function setSignerControlsEnabled(enabled: boolean): void {
  sendBtnEl.disabled = !enabled;
  signBtnEl.disabled = !enabled;
  trustBtnEl.disabled = !enabled;
  copyAddressBtnEl.disabled = !enabled;
}

function setReadinessBadge(sdkReady: boolean): void {
  readinessEl.textContent = sdkReady ? 'Read status: ready' : 'Read status: not ready';
  readinessEl.className = sdkReady ? 'pill ok' : 'pill warn';
}

function setWriteBadge(ready: boolean): void {
  writeReadyEl.textContent = ready ? 'Write status: ready' : 'Write status: connect host wallet';
  writeReadyEl.className = ready ? 'pill ok' : 'pill neutral';
}

function setSummaryDefaults(): void {
  avatarSummaryEl.textContent = '–';
  trustSummaryEl.textContent = '–';
  balanceSummaryEl.textContent = '–';
}

onWalletChange((address) => {
  connectedAddress = isAddress(address) ? address : null;

  if (connectedAddress) {
    walletStatusEl.className = 'status connected';
    walletStatusEl.textContent = `Connected signer: ${connectedAddress}`;
    setSignerControlsEnabled(true);
    setWriteBadge(true);
    receiveAddressEl.textContent = connectedAddress;
    sendToEl.placeholder = '0xRecipient...';
    if (!queryAddressEl.value) queryAddressEl.value = connectedAddress;
    return;
  }

  walletStatusEl.className = 'status disconnected';
  walletStatusEl.textContent = isMiniappMode()
    ? 'Waiting for wallet connection in host…'
    : 'No host wallet. You can still try read-only SDK actions.';
  setSignerControlsEnabled(false);
  setWriteBadge(false);
  receiveAddressEl.textContent = 'No wallet address yet.';
  sendToEl.placeholder = 'Connect host wallet to enable sending';
});

async function initSdk(): Promise<void> {
  setModeBadge();

  if (isMiniappMode()) {
    runner = await MiniAppPostMessageRunner.create('https://rpc.aboutcircles.com/', gnosis as any, {
      targetOrigin: '*',
    });

    sdk = new Sdk(circlesConfig[100] as any, runner as any);
    setResult({
      step: 'init',
      mode: 'miniapp',
      signerAddress: runner.address,
      message: 'SDK ready with miniapp signer.',
    });
    setReadinessBadge(true);
    setWriteBadge(Boolean(runner?.address));
    return;
  }

  sdk = new Sdk(circlesConfig[100] as any);
  setResult({
    step: 'init',
    mode: 'standalone',
    message: 'SDK ready in read-only mode. Open in host for signing and writes.',
  });
  setReadinessBadge(true);
  setWriteBadge(false);
}

async function loadAddressOverview(address: `0x${string}`): Promise<void> {
  if (!sdk) {
    setReadResult({ error: 'SDK not initialized.' });
    return;
  }

  loadMineBtnEl.disabled = true;
  loadAddressBtnEl.disabled = true;
  setReadResult({ step: 'read', message: 'Loading avatar, trust and balances…', address });

  try {
    const [avatarInfo, trustRelations, balances] = await Promise.all([
      sdk.data.getAvatar(address),
      sdk.data.getTrustRelations(address),
      sdk.data.getBalances(address),
    ]);

    const nonZeroBalances = balances.filter((b: any) => getBalanceAttoValue(b) > 0n);

    const totalBalanceAtto = sumBalancesToAtto(
      balances as Array<{ attoCrc?: unknown; attoCircles?: unknown; amount?: unknown; balance?: unknown }>,
    );
    const totalBalanceCircles = sumBalancesToCircles(
      balances as Array<{ circles?: unknown; crc?: unknown; staticCircles?: unknown }>,
    );

    avatarSummaryEl.textContent = `${avatarInfo?.avatar ?? 'unknown'} (${avatarInfo?.version ?? 'n/a'})`;
    trustSummaryEl.textContent = `${trustRelations.length.toString()} relation(s)`;
    balanceSummaryEl.textContent = formatCircles(totalBalanceCircles);

    setReadResult({
      address,
      avatar: {
        avatar: avatarInfo?.avatar,
        version: avatarInfo?.version,
        hasV1: Boolean(avatarInfo?.hasV1),
      },
      trust: {
        count: trustRelations.length,
        sample: trustRelations.slice(0, 4),
      },
      balances: {
        totalBalanceAtto,
        totalBalanceCircles,
        totalEntries: balances.length,
        nonZeroEntries: nonZeroBalances.length,
        sample: nonZeroBalances.slice(0, 6),
      },
    });
  } catch (error) {
    setReadResult({ error: error instanceof Error ? error.message : String(error) });
  }

  loadMineBtnEl.disabled = false;
  loadAddressBtnEl.disabled = false;
}

async function onLoadMine(): Promise<void> {
  if (!connectedAddress) {
    setReadResult({ error: 'No connected signer address yet.' });
    return;
  }
  queryAddressEl.value = connectedAddress;
  await loadAddressOverview(connectedAddress);
}

async function onLoadAddress(): Promise<void> {
  const address = queryAddressEl.value.trim();
  if (!isAddress(address)) {
    setReadResult({ error: 'Please enter a valid address (0x...)' });
    return;
  }
  await loadAddressOverview(address);
}

async function onSignMessage(): Promise<void> {
  if (!runner) {
    setResult({ error: 'Miniapp runner not available in standalone mode.' });
    return;
  }

  const message = messageInputEl.value.trim();
  if (!message) {
    setResult({ error: 'Please enter a message to sign.' });
    return;
  }

  const signatureType = signatureTypeEl.value as 'erc1271' | 'raw';
  signBtnEl.disabled = true;
  setResult({ step: 'sign', message: 'Requesting signature from host wallet…' });

  try {
    const signature = await runner.signMessage(message, signatureType);
    setResult({
      step: 'sign',
      signer: runner.address,
      signatureType,
      message,
      signature,
    });
  } catch (error) {
    setResult({ step: 'sign', error: error instanceof Error ? error.message : String(error) });
  }

  signBtnEl.disabled = false;
}

async function onSendCircles(): Promise<void> {
  if (!sdk || !runner?.address) {
    setResult({ error: 'Runner unavailable. Open this in miniapp host.' });
    return;
  }

  const to = sendToEl.value.trim();
  if (!isAddress(to)) {
    setResult({ error: 'Please enter a valid recipient address.' });
    return;
  }

  let amountAtto: bigint;
  try {
    amountAtto = parseCrcToAtto(sendAmountEl.value);
  } catch (error) {
    setResult({ error: error instanceof Error ? error.message : String(error) });
    return;
  }

  sendBtnEl.disabled = true;
  setResult({
    step: 'send',
    message: 'Submitting transfer transaction…',
    from: runner.address,
    to,
    amount: formatCrcFromAtto(amountAtto),
  });

  try {
    const ownAvatar = await sdk.getAvatar(runner.address);
    const receipt = await ownAvatar.transfer.direct(to, amountAtto);
    setResult({
      step: 'send',
      action: 'avatar.transfer.direct',
      from: runner.address,
      to,
      amount: formatCrcFromAtto(amountAtto),
      transactionHash: receipt.transactionHash,
      status: receipt.status,
    });

    sendAmountEl.value = '';
  } catch (error) {
    setResult({ step: 'send', error: error instanceof Error ? error.message : String(error) });
  }

  sendBtnEl.disabled = false;
}

async function onTrustAdd(): Promise<void> {
  if (!sdk || !runner?.address) {
    setResult({ error: 'Runner unavailable. Open this in miniapp host.' });
    return;
  }

  const target = trustTargetEl.value.trim();
  if (!isAddress(target)) {
    setResult({ error: 'Please enter a valid address to trust.' });
    return;
  }

  trustBtnEl.disabled = true;
  setResult({ step: 'write', message: 'Submitting trust.add transaction…' });

  try {
    const ownAvatar = await sdk.getAvatar(runner.address);
    const receipt = await ownAvatar.trust.add(target);

    setResult({
      step: 'write',
      action: 'avatar.trust.add',
      from: runner.address,
      to: target,
      transactionHash: receipt.transactionHash,
      status: receipt.status,
    });
  } catch (error) {
    setResult({ step: 'write', error: error instanceof Error ? error.message : String(error) });
  }

  trustBtnEl.disabled = false;
}

async function onCopyAddress(): Promise<void> {
  if (!connectedAddress) {
    setResult({ error: 'No connected address to copy yet.' });
    return;
  }

  try {
    await navigator.clipboard.writeText(connectedAddress);
    setResult({ step: 'receive', message: 'Address copied to clipboard.', address: connectedAddress });
  } catch {
    setResult({
      step: 'receive',
      message: 'Clipboard unavailable. Copy address manually.',
      address: connectedAddress,
    });
  }
}

setReadinessBadge(false);
setWriteBadge(false);
setSummaryDefaults();
receiveAddressEl.textContent = 'No wallet address yet.';
walletStatusEl.textContent = 'Initializing…';
sendToEl.placeholder = 'Connect host wallet to enable sending';

loadMineBtnEl.addEventListener('click', () => void onLoadMine());
loadAddressBtnEl.addEventListener('click', () => void onLoadAddress());
copyAddressBtnEl.addEventListener('click', () => void onCopyAddress());
sendBtnEl.addEventListener('click', () => void onSendCircles());
signBtnEl.addEventListener('click', () => void onSignMessage());
trustBtnEl.addEventListener('click', () => void onTrustAdd());

void initSdk().catch((error) => {
  setResult({
    error: 'Failed to initialize miniapp SDK context.',
    details: error instanceof Error ? error.message : String(error),
  });
});
