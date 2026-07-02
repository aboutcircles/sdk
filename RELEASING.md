# Releasing

All packages are versioned in **lockstep** (one version across the whole
monorepo) and published to npm under the `@aboutcircles/*` scope with
provenance. Releases are cut by the **Release** GitHub Actions workflow
(`.github/workflows/release.yml`), triggered manually via **workflow_dispatch**
— the PR itself never bumps versions.

## Stable release

1. Actions → **Release** → **Run workflow**.
2. Pick `version_type`: `patch` | `minor` | `major`.
3. The workflow builds, bumps every package to the new version, commits
   `chore: bump version to X.Y.Z`, tags `vX.Y.Z`, publishes all packages to the
   default **`latest`** dist-tag, and pushes the commit + tag.

Consumers get it via `npm i @aboutcircles/sdk` as usual.

## Release candidate (RC) for internal testing

1. Actions → **Release** → **Run workflow**, **on the PR/release branch**.
2. Pick `version_type`: `prerelease`.
3. Produces `X.Y.(Z+1)-rc.0` (or bumps `-rc.n → -rc.(n+1)` if already on an RC of
   the same series) and publishes to the **`next`** dist-tag — so `latest` (the
   last stable) is untouched.

Install the RC:

```bash
npm i @aboutcircles/sdk@next        # newest RC on the next tag
npm i @aboutcircles/sdk@0.1.58-rc.0 # or pin an exact RC
```

**Why internal deps still line up:** the packages pin each other as `"*"`, which
npm resolves *excluding* prereleases — so a naive RC umbrella would pull the last
*stable* sub-packages. `scripts/publish.ts` therefore rewrites each internal
`@aboutcircles/*` dep to the **exact** RC version *in the published tarball only*
(the on-disk change is reverted right after each publish; committed source keeps
`"*"`). So `@aboutcircles/sdk@x-rc.n` transitively resolves the matching RC
sub-packages.

### Promote an RC to stable

Dispatch **Release** with `version_type: patch` while on an `-rc.n` version — it
**finalizes** to the release core (`0.1.58-rc.3 → 0.1.58`) rather than skipping a
number, and publishes to `latest`.

### ⚠️ Keep RC bumps off `main`

The workflow commits the version bump + tag and `git push`es them to the ref it
was dispatched from. An RC bump commit (`chore: bump version to X.Y.Z-rc.n`) and
its tag land on that branch. **Do not merge that commit into `main`** — either
dispatch RCs from a throwaway release branch, or drop/reset the bump commit
before merging the PR, so `main` keeps a clean stable version line and `"*"`
internal deps.

## Local dry check

The version math and dep-pinning are pure functions with unit tests:

```bash
bun test scripts/release-tooling.test.ts
```
