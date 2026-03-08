# Circles Mini App Browser Example (TypeScript + Vite)

This is a polished **starter mini app** for new Circles developers.

It keeps things simple, but showcases the most important basics in one page:

1. **Read Circles data** for an address (avatar, trust, balances)
2. **Sign a message** via miniapp host wallet
3. **Send one write transaction** (`avatar.trust.add`)

Under the hood it uses:

- `@aboutcircles/sdk`
- `@aboutcircles/sdk-core`
- `MiniAppPostMessageRunner` from the local runner source (see note below)

The example is built to feel like a practical template you can fork for your own mini app.

## What this example demonstrates

- miniapp host detection + wallet connection state
- read flows with `sdk.data` methods
- signer flows with `runner.signMessage(message, 'erc1271' | 'raw')`
- write flow with `sdk.getAvatar(address).trust.add(target)`
- safe output rendering for `bigint` values

## Files

- `index.html` – structured, guided starter UI
- `styles.css` – clean responsive styling
- `src/miniapp-sdk.ts` – host wallet event bridge
- `src/main.ts` – SDK/runner logic and action handlers
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
- The runner is imported from `packages/runner/src/miniapp-postmessage-runner` because the currently published `@aboutcircles/sdk-runner` package does not export `MiniAppPostMessageRunner` yet.
