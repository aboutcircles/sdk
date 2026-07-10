import { $ } from "bun";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

// Packages kept in lockstep — every release sets all of these to one version.
const packages = [
  "types",
  "abis",
  "utils",
  "core",
  "rpc",
  "profiles",
  "pathfinder",
  "transfers",
  "invitations",
  "permissionless-groups",
  "runner",
  "sdk",
  "miniapp-sdk",
];

export type VersionType = "major" | "minor" | "patch" | "prerelease";

export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
  /** Prerelease identifier, e.g. "rc" — undefined for a stable version. */
  preid?: string;
  /** Prerelease counter, e.g. 0 in `-rc.0` — undefined for a stable version. */
  prenum?: number;
}

/**
 * Parse `X.Y.Z` or `X.Y.Z-<preid>.<n>` (the only two shapes this repo emits).
 * Throws on anything else so a malformed version fails loudly instead of
 * silently producing `NaN` segments (the old `split(".").map(Number)` turned
 * `0.1.58-rc.0` into `[0, 1, NaN, 0]`).
 */
export function parseVersion(version: string): ParsedVersion {
  const m = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+)\.(\d+))?$/);
  if (!m) {
    throw new Error(
      `Unparseable version "${version}" (expected X.Y.Z or X.Y.Z-preid.N)`,
    );
  }
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
    preid: m[4],
    prenum: m[5] === undefined ? undefined : Number(m[5]),
  };
}

/**
 * Compute the next version. Mirrors `npm version <type>` semantics for the
 * cases this repo uses:
 *   - major / minor: bump that segment, drop any prerelease.
 *   - patch: `X.Y.Z → X.Y.(Z+1)`, but *finalize* a prerelease in place
 *     (`X.Y.Z-rc.n → X.Y.Z`) so an RC promotes to its own stable number
 *     rather than skipping it.
 *   - prerelease: from stable, open an RC for the next patch
 *     (`X.Y.Z → X.Y.(Z+1)-rc.0`); from a matching-preid RC, bump the counter
 *     (`…-rc.0 → …-rc.1`); from a different preid, restart at `.0`.
 */
export function nextVersion(
  current: string,
  type: VersionType,
  preid = "rc",
): string {
  const { major, minor, patch, preid: curPreid, prenum } =
    parseVersion(current);
  const isPre = prenum !== undefined;

  switch (type) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "prerelease":
      if (isPre && curPreid === preid) {
        return `${major}.${minor}.${patch}-${preid}.${prenum! + 1}`;
      }
      if (isPre) {
        // switching preid mid-cycle (rare) — restart the counter, keep the core
        return `${major}.${minor}.${patch}-${preid}.0`;
      }
      return `${major}.${minor}.${patch + 1}-${preid}.0`;
    case "patch":
    default:
      // Finalize a prerelease to its release core; otherwise a normal patch.
      return isPre
        ? `${major}.${minor}.${patch}`
        : `${major}.${minor}.${patch + 1}`;
  }
}

if (import.meta.main) {
  const versionType = (process.argv[2] || "patch") as VersionType;
  const preid = process.argv[3] || "rc";
  const packagesDir = resolve(__dirname, "../packages");

  // Get current version from the main SDK package.
  const sdkPackage = JSON.parse(
    readFileSync(resolve(packagesDir, "sdk/package.json"), "utf-8"),
  );
  const currentVersion: string = sdkPackage.version;
  const newVersion = nextVersion(currentVersion, versionType, preid);

  console.log(`Bumping version from ${currentVersion} to ${newVersion}`);

  // Update all package.json files (versions only — internal `@aboutcircles/*`
  // dep ranges stay `"*"`; prerelease pinning happens at publish time).
  for (const pkg of packages) {
    const pkgPath = resolve(packagesDir, `${pkg}/package.json`);
    const pkgJson = JSON.parse(readFileSync(pkgPath, "utf-8"));
    pkgJson.version = newVersion;

    writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2) + "\n");
    console.log(`  ✓ Updated ${pkg}`);
  }

  // Commit changes
  await $`git add packages/*/package.json`;
  await $`git commit -m "chore: bump version to ${newVersion}"`;
  await $`git tag v${newVersion}`;

  console.log(`\n✓ Version bumped and tagged: v${newVersion}`);
}
