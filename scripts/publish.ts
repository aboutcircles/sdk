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
];

const packagesDir = join(process.cwd(), 'packages');

async function publishPackage(pkg: string): Promise<boolean> {
  const pkgPath = join(packagesDir, pkg);

  // Read package.json to get actual name and version
  const pkgJsonPath = join(pkgPath, 'package.json');
  const pkgJson = JSON.parse(await $`cat ${pkgJsonPath}`.text());
  const pkgName = pkgJson.name;
  const version = pkgJson.version;

  console.log(`\n📦 Publishing ${pkgName}...`);

  try {
    // Use npm publish for provenance support (Bun doesn't support --provenance yet)
    await $`cd ${pkgPath} && npm publish --access public --provenance 2>&1`;
    console.log(`✅ Published ${pkgName}@${version}`);
    return true;
  } catch (error) {
    const errorStr = String(error);

    if (errorStr.includes('EPUBLISHCONFLICT') || errorStr.includes('cannot publish over previously published version')) {
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
      if (retryErrorStr.includes('EPUBLISHCONFLICT') || retryErrorStr.includes('cannot publish over previously published version')) {
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
