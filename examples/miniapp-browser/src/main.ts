  import '../styles.css';

import { Sdk } from '@aboutcircles/sdk';
import { circlesConfig } from '@aboutcircles/sdk-core';
import { MiniAppPostMessageRunner } from '../../../packages/runner/src/miniapp-postmessage-runner';
import { gnosis } from 'viem/chains';

import { isMiniappMode, onWalletChange } from './miniapp-sdk';

const modeEl = document.getElementById('mode') as HTMLParagraphElement;
const walletStatusEl = document.getElementById('walletStatus') as HTMLDivElement;
const queryAddressEl = document.getElementById('queryAddress') as HTMLInputElement;
const refreshBtnEl = document.getElementById('refreshBtn') as HTMLButtonElement;
const readResultEl = document.getElementById('readResult') as HTMLPreElement;
const trustTargetEl = document.getElementById('trustTarget') as HTMLInputElement;
const trustBtnEl = document.getElementById('trustBtn') as HTMLButtonElement;
const messageInputEl = document.getElementById('messageInput') as HTMLTextAreaElement;
const signatureTypeEl = document.getElementById('signatureType') as HTMLSelectElement;
const signBtnEl = document.getElementById('signBtn') as HTMLButtonElement;
const resultEl = document.getElementById('result') as HTMLPreElement;

let sdk: Sdk | undefined;
let runner: any;
let connectedAddress: `0x${string}` | null = null;

function stringifyForUi(value: unknown): string {
  return JSON.stringify(
    value,
    (_key, v) => (typeof v === 'bigint' ? v.toString() : v),
    2,
  );
}

function setResult(obj: unknown): void {
  resultEl.textContent = stringifyForUi(obj);
}

function setReadResult(obj: unknown): void {
  readResultEl.textContent = stringifyForUi(obj);
}

function isAddress(value: string | null | undefined): value is `0x${string}` {
  return /^0x[a-fA-F0-9]{40}$/.test(String(value ?? ''));
}

function setMode(): void {
  if (isMiniappMode()) {
    modeEl.textContent = 'Running inside miniapp host iframe';
    modeEl.className = 'pill ok';
  } else {
    modeEl.textContent = 'Standalone browser mode (no host wallet available)';
    modeEl.className = 'pill warn';
  }
}

setMode();

onWalletChange((address) => {
  connectedAddress = isAddress(address) ? address : null;

  if (connectedAddress) {
    walletStatusEl.className = 'status connected';
    walletStatusEl.textContent = `Connected miniapp signer: ${connectedAddress}`;
    signBtnEl.disabled = false;
    trustBtnEl.disabled = false;

    if (!queryAddressEl.value) {
      queryAddressEl.value = connectedAddress;
    }
    return;
  }

  walletStatusEl.className = 'status disconnected';
  walletStatusEl.textContent = isMiniappMode()
    ? 'Waiting for wallet connection…'
    : 'Standalone mode: read-only SDK works, signer/write features disabled';

  signBtnEl.disabled = true;
  trustBtnEl.disabled = true;
});

async function initSdk(): Promise<void> {
  if (isMiniappMode()) {
    runner = await MiniAppPostMessageRunner.create('https://rpc.aboutcircles.com/', gnosis as any, {
      targetOrigin: '*',
    });

    sdk = new Sdk(circlesConfig[100] as any, runner as any);
    setResult({
      status: 'SDK initialized with MiniAppPostMessageRunner',
      signerAddress: runner.address,
      note: 'You can query and execute write methods without MetaMask.',
    });
    return;
  }

  sdk = new Sdk(circlesConfig[100] as any);
  setResult({
    status: 'SDK initialized in read-only mode',
    note: 'Open inside Circles miniapp host to enable signer/write methods.',
  });
}

async function refreshData(): Promise<void> {
  if (!sdk) {
    setReadResult({ error: 'SDK not initialized yet' });
    return;
  }

  const queryAddress = queryAddressEl.value.trim() || connectedAddress;
  if (!isAddress(queryAddress)) {
    setReadResult({ error: 'Please provide a valid query address (0x...)' });
    return;
  }

  refreshBtnEl.disabled = true;
  setReadResult({ status: 'Fetching avatar/trust/balances via SDK…', address: queryAddress });

  try {
    const [avatarInfo, trustRelations, balances] = await Promise.all([
      sdk.data.getAvatar(queryAddress),
      sdk.data.getTrustRelations(queryAddress),
      sdk.data.getBalances(queryAddress),
    ]);

    setReadResult({
      address: queryAddress,
      avatarInfo,
      trustRelationsCount: trustRelations.length,
      trustRelationsPreview: trustRelations.slice(0, 3),
      balancesCount: balances.length,
      balancesPreview: balances.slice(0, 5),
    });
  } catch (error) {
    setReadResult({ error: error instanceof Error ? error.message : String(error) });
  }

  refreshBtnEl.disabled = false;
}

async function trustAdd(): Promise<void> {
  if (!sdk || !runner?.address) {
    setResult({ error: 'Runner unavailable. Open in miniapp host and connect wallet.' });
    return;
  }

  const trustTarget = trustTargetEl.value.trim();
  if (!isAddress(trustTarget)) {
    setResult({ error: 'Please provide a valid trust target address (0x...)' });
    return;
  }

  trustBtnEl.disabled = true;
  setResult({ status: 'Submitting sdk.getAvatar(address).trust.add(target)…' });

  try {
    const ownAvatar = await sdk.getAvatar(runner.address);
    const receipt = await ownAvatar.trust.add(trustTarget);

    setResult({
      action: 'avatar.trust.add',
      from: runner.address,
      to: trustTarget,
      transactionHash: receipt.transactionHash,
      status: receipt.status,
    });
  } catch (error) {
    setResult({
      action: 'avatar.trust.add',
      error: error instanceof Error ? error.message : String(error),
    });
  }

  trustBtnEl.disabled = false;
}

async function signViaRunner(): Promise<void> {
  if (!runner) {
    setResult({ error: 'Runner is unavailable in standalone mode.' });
    return;
  }

  const message = messageInputEl.value.trim();
  const signatureType = signatureTypeEl.value as 'erc1271' | 'raw';

  if (!message) {
    setResult({ error: 'Message is required' });
    return;
  }

  signBtnEl.disabled = true;
  setResult({ status: 'Requesting signature via MiniAppPostMessageRunner…' });

  try {
    const signed = await runner.signMessage(message, signatureType);
    setResult({
      action: 'runner.signMessage',
      message,
      signatureType,
      signer: runner.address,
      result: signed,
    });
  } catch (error) {
    setResult({
      action: 'runner.signMessage',
      error: error instanceof Error ? error.message : String(error),
    });
  }

  signBtnEl.disabled = false;
}

refreshBtnEl.addEventListener('click', () => void refreshData());
trustBtnEl.addEventListener('click', () => void trustAdd());
signBtnEl.addEventListener('click', () => void signViaRunner());

void initSdk()
  .then(() => {
    if (queryAddressEl.value || connectedAddress) {
      void refreshData();
    }
  })
  .catch((error) => {
    setResult({
      error: 'Failed to initialize SDK/runner',
      details: error instanceof Error ? error.message : String(error),
    });
  });
