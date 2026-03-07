# Circles Mini App Browser Example (TypeScript + Vite)

This example is a **TypeScript** mini app using a small Vite pipeline and the real SDK packages:

- `@aboutcircles/sdk`
- `@aboutcircles/sdk-core`
- `@aboutcircles/sdk-runner` (`MiniAppPostMessageRunner`)

It demonstrates the same SDK compatibility as regular apps, but with the miniapp host signer
instead of requiring MetaMask.

It demonstrates:

- SDK initialization with miniapp runner signer
- SDK read methods (`sdk.data.getAvatar`, `sdk.data.getTrustRelations`, `sdk.data.getBalances`)
- SDK write method (`sdk.getAvatar(runner.address).trust.add(...)`)
- Direct signer call via runner (`runner.signMessage(message, 'erc1271' | 'raw')`)

## Files

- `index.html` – UI
- `styles.css` – styling
- `src/miniapp-sdk.ts` – minimal host wallet connection listener
- `src/main.ts` – SDK + runner integration and app logic
- `package.json` / `tsconfig.json` – build setup

## Install & run locally

```bash
npm install --prefix examples/miniapp-browser
```

Dev server:

```bash
npm run --prefix examples/miniapp-browser dev
```

Build:

```bash
npm run --prefix examples/miniapp-browser build
```

Then open:

- Standalone mode: `http://localhost:5173` (default Vite port)
- Embedded in host (example): `https://circles.gnosis.io/miniapps/<slug>` (configure app URL to your local/public URL)

## Notes

- In standalone mode, SDK read queries still work, but signer/write features are disabled.
- Inside the Circles mini app host iframe, the app initializes `MiniAppPostMessageRunner` and uses the host wallet as signer.
- This gives you miniapp-native signing while remaining SDK-compatible for Circles data, profiles, trust, transfers, etc.
