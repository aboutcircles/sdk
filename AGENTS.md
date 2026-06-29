# AGENTS.md

Tool-agnostic instructions for AI coding agents. `CLAUDE.md` points here.
The "General" and "SDK work" sections are portable — copy them into other repos' AGENTS.md unchanged.

## General — before implementing any ticket
A short ticket is a starting point, not a spec. Before writing code:
1. Reconstruct intent — read the parent/sibling tickets and any linked spec; a terse ticket is
   usually a slice of a bigger one.
2. Find the canonical entry point — trace how the product actually does this before picking a file;
   don't anchor on the first function with a matching-looking parameter.
3. Find prior art — search for the feature/param; if a partial implementation exists, extend it
   rather than building a parallel one.
4. Design producer + consumer together — for anything that stores/carries/emits data, name who
   reads it back and through what API. A missing reader is in scope, not someone else's job.
5. Confirm scope & placement before coding — if discovery shows the task is bigger or belongs
   elsewhere than the ticket implies, say so and check in. Cheaper as a sentence than a diff.

### Definition of done
- Verified by the path a user actually takes, end-to-end — not just the function you wrote.
- Tests exercise the real entry point, not only the new code in isolation.
- If you bound scope (one path, write-only, TODO), state it explicitly in the PR — never ship an
  open loop silently.

## SDK work (portable across SDK repos)
- An SDK is consumed by callers: a feature isn't done until a caller can use it end-to-end —
  public method + exported types + docs + tests, not just the implementation.
- Symmetry: if you add a way to write/encode/send something, add or confirm the way to
  read/decode/query it back.
- Match the conventions of the package you touch (signatures, input normalization, error types,
  paged responses, test layout) rather than inventing local ones.
- Prefer extending an existing public method over adding a parallel mechanism for the same case.

## This repo — aboutcircles/sdk
Bun-workspaces monorepo under `packages/*` (types, utils, abis, core, rpc, runner, pathfinder,
profiles, transfers, invitations, permissionless-groups, sdk, miniapp-sdk).

### Build & test
- Build: `bun run build` (tsc --build + per-package bun builds).
- Test: `bun test <path>` (bun:test). Keep tests out of the tsc build
  (`exclude: ["**/*.test.ts"]` in the package tsconfig) — existing convention.
- Release version bump: `bun run version:patch|minor|major`.

### Transfers & annotations (bit us in PR #68 vs #69)
- Group CRC (gCRC) is sent via `PermissionlessGroup.transferGroupCrc` — canonical path, with
  demurrage->inflationary consolidation and org routing. Generic `CommonAvatar.transfer.direct` /
  `_transferErc20` does NOT handle group semantics and is bypassed by gCRC sends.
- Annotations: ERC-20 has no data field; carry the blob on a 0-value ERC-1155 `Hub.safeTransferFrom`
  batched with the transfer. Encode/decode with `encode`/`decodeCrcV2TransferData`
  (`@aboutcircles/sdk-utils`); read back via `rpc.transaction.getTransferData()` -> `TransferDataRow`.
- Part of the Annotated-Transactions project (CRC-2265 / CRC-1905 + Notion spec) — check those first.

## Writing tickets
Use `docs/implementation-ticket-template.md` — it forces the fields whose absence sent PR #68 down the
wrong path (parent/spec link, read path, integration point).
