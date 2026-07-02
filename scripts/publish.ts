#!/usr/bin/env bun
/**
 * Cross-platform publishing script for all SDK packages.
 * Publishes packages in dependency order with proper error handling.
 *
 * Dist-tags:
 *   - Stable versions (`X.Y.Z`) publish to the default `latest` tag.
 *   - Prerelease versions (`X.Y.Z-rc.n`) publish to `next`, so `npm i <pkg>`
 *     keeps resolving the last stable release.
 *
 * Prerelease internal-dep pinning:
 *   This repo pins internal `@aboutcircles/*` deps as `"*"`, which npm resolves
 *   *excluding* prereleases — so an umbrella `@aboutcircles/sdk@x-rc.n` would
 *   otherwise pull the last *stable* sub-packages, not the matching RC ones.
 *   For prerelease publishes we therefore rewrite each internal dep to the
 *   exact prerelease version in the published tarball. The rewrite is applied
 *   to the on-disk package.json only for the duration of the publish and
 *   restored afterwards (verbatim), so the working tree / git stay clean.
 */
import { $ } from 'bun';
import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

// Define packages in dependency order
const packages = [
  'types',          // Base types - no dependencies
  'abis',           // Contract ABIs - depends on types
  'utils',          // Utilities - depends on types
  'profiles',       // Profiles - depends on types, utils
  'core',           // Core SDK - depends on types, abis, utils
  'rpc',            // RPC client - depends on types, utils
  'pathfinder',     // Pathfinder - depends on types, utils
  'transfers',      // Transfers - depends on types, core, pathfinder
  'invitations',    // Invitations - depends on types, utils, rpc, core, transfers
  'permissionless-groups', // Score-gated groups - depends on types, utils, core
  'runner',         // Contract runner - depends on sdk
  'sdk',            // Main SDK - depends on most packages
  'miniapp-sdk',    // Mini app iframe SDK - standalone
];

const packagesDir = join(process.cwd(), 'packages');

const INTERNAL_SCOPE = '@aboutcircles/';
const DEP_FIELDS = [
  'dependencies',
  'peerDependencies',
  'optionalDependencies',
] as const;

/** A version is a prerelease iff it carries a `-` suffix (e.g. `0.1.58-rc.0`). */
export function isPrerelease(version: string): boolean {
  return version.includes('-');
}

/**
 * Return a copy of `pkgJson` with every internal `@aboutcircles/*` dependency
 * range replaced by the exact `version`. Only the internal scope is touched;
 * third-party ranges are left as-is. Used only for prerelease publishes.
 */
export function pinInternalDeps(
  pkgJson: Record<string, any>,
  version: string,
): Record<string, any> {
  const next = { ...pkgJson };
  for (const field of DEP_FIELDS) {
    const deps = pkgJson[field];
    if (!deps) continue;
    const pinned: Record<string, string> = { ...deps };
    for (const name of Object.keys(pinned)) {
      if (name.startsWith(INTERNAL_SCOPE)) pinned[name] = version;
    }
    next[field] = pinned;
  }
  return next;
}

function isAlreadyPublished(error: string): boolean {
  return error.includes('EPUBLISHCONFLICT') ||
    error.includes('cannot publish over previously published version');
}

async function isVersionPublished(pkgName: string, version: string): Promise<boolean> {
  try {
    await $`npm view ${pkgName}@${version} version --silent 2>/dev/null`.quiet();
    return true;
  } catch {
    return false;
  }
}

async function runPublish(
  pkgPath: string,
  pkgName: string,
  version: string,
  distTag: string,
): Promise<boolean> {
  try {
    // Use npm publish for provenance support (Bun doesn't support --provenance yet)
    await $`cd ${pkgPath} && npm publish --access public --provenance --tag ${distTag} 2>&1`;
    console.log(`✅ Published ${pkgName}@${version} (tag: ${distTag})`);
    return true;
  } catch (error) {
    const errorStr = String(error);

    if (isAlreadyPublished(errorStr)) {
      console.log(`⚠️  Version ${version} already published, skipping...`);
      return true;
    }

    // If provenance fails, try without it
    console.log(`⚠️  Retrying without provenance...`);
    try {
      await $`cd ${pkgPath} && npm publish --access public --tag ${distTag} 2>&1`;
      console.log(`✅ Published ${pkgName}@${version} (tag: ${distTag})`);
      return true;
    } catch (retryError) {
      const retryErrorStr = String(retryError);
      if (isAlreadyPublished(retryErrorStr)) {
        console.log(`⚠️  Version ${version} already published, skipping...`);
        return true;
      }
      console.error(`❌ Failed to publish ${pkgName}`);
      console.error(`Error: ${retryErrorStr}`);
      return false;
    }
  }
}

async function publishPackage(pkg: string): Promise<boolean> {
  const pkgPath = join(packagesDir, pkg);
  const pkgJsonPath = join(pkgPath, 'package.json');

  // Keep the exact original bytes so we can restore them verbatim.
  const original = readFileSync(pkgJsonPath, 'utf-8');
  const pkgJson = JSON.parse(original);
  const pkgName = pkgJson.name ?? `@aboutcircles/sdk-${pkg}`;
  const version = pkgJson.version;
  const distTag = isPrerelease(version) ? 'next' : 'latest';
  console.log(`\n📦 Publishing ${pkgName}@${version} (tag: ${distTag})...`);

  if (await isVersionPublished(pkgName, version)) {
    console.log(`⚠️  ${pkgName}@${version} already published, skipping...`);
    return true;
  }

  // For prereleases, pin internal deps to the exact version in the published
  // tarball (see file header). Restore the original file no matter what so the
  // working tree never carries the pins.
  let pinned = false;
  if (isPrerelease(version)) {
    writeFileSync(
      pkgJsonPath,
      JSON.stringify(pinInternalDeps(pkgJson, version), null, 2) + '\n',
    );
    pinned = true;
  }

  try {
    return await runPublish(pkgPath, pkgName, version, distTag);
  } finally {
    if (pinned) writeFileSync(pkgJsonPath, original);
  }
}

async function main() {
  console.log('🚀 Starting publication of all packages...\n');

  for (const pkg of packages) {
    const success = await publishPackage(pkg);
    if (!success) {
      console.error('\n❌ Publication failed! Stopping process.');
      process.exit(1);
    }
  }

  console.log('\n🎉 All packages published successfully!');
}

if (import.meta.main) {
  main();
}
