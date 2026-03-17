#!/usr/bin/env bun
/**
 * Cross-platform publishing script for all SDK packages
 * Publishes packages in dependency order with proper error handling
 */
import { $ } from 'bun';
import { join } from 'path';

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
  'runner',         // Contract runner - depends on sdk
  'sdk',            // Main SDK - depends on most packages
  'miniapp-sdk',    // Mini app iframe SDK - standalone
];

const packagesDir = join(process.cwd(), 'packages');

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

async function publishPackage(pkg: string): Promise<boolean> {
  const pkgPath = join(packagesDir, pkg);

  // Read package.json to get actual name and version
  const pkgJsonPath = join(pkgPath, 'package.json');
  const pkgJson = JSON.parse(await $`cat ${pkgJsonPath}`.text());
  const pkgName = pkgJson.name ?? `@aboutcircles/sdk-${pkg}`;
  const version = pkgJson.version;
  console.log(`\n📦 Publishing ${pkgName}...`);

  if (await isVersionPublished(pkgName, version)) {
    console.log(`⚠️  ${pkgName}@${version} already published, skipping...`);
    return true;
  }

  try {
    // Use npm publish for provenance support (Bun doesn't support --provenance yet)
    await $`cd ${pkgPath} && npm publish --access public --provenance 2>&1`;
    console.log(`✅ Published ${pkgName}@${version}`);
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
      await $`cd ${pkgPath} && npm publish --access public 2>&1`;
      console.log(`✅ Published ${pkgName}@${version}`);
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

main();
