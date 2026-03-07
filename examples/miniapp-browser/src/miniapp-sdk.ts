type WalletListener = (address: string | null) => void;

let address: string | null = null;
const walletListeners: WalletListener[] = [];

function inMiniappHost(): boolean {
  return typeof window !== 'undefined' && window.parent !== window;
}

if (typeof window !== 'undefined') {
  window.addEventListener('message', (event: MessageEvent) => {
    const data = event.data as { type?: string; address?: string } | undefined;
    if (!data || typeof data.type !== 'string') return;

    switch (data.type) {
      case 'wallet_connected':
        address = data.address ?? null;
        walletListeners.forEach((fn) => fn(address));
        break;
      case 'wallet_disconnected':
        address = null;
        walletListeners.forEach((fn) => fn(null));
        break;
      default:
        break;
    }
  });

  if (inMiniappHost()) {
    window.parent.postMessage({ type: 'request_address' }, '*');
  }
}

export function isMiniappMode(): boolean {
  return inMiniappHost();
}

export function onWalletChange(fn: WalletListener): () => void {
  walletListeners.push(fn);
  fn(address);

  return () => {
    const idx = walletListeners.indexOf(fn);
    if (idx !== -1) walletListeners.splice(idx, 1);
  };
}
