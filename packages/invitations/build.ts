/**
 * Custom build script for invitations package
 * Builds from source files to deduplicate dependencies like @noble/hashes
 */
import { build } from 'bun';
import { resolve, dirname } from 'path';

const packagesDir = resolve(dirname(import.meta.path), '..');

// Map workspace packages to their source entry points
const workspaceAliases: Record<string, string> = {
  '@aboutcircles/sdk-types': resolve(packagesDir, 'types/src/index.ts'),
  '@aboutcircles/sdk-utils': resolve(packagesDir, 'utils/src/index.ts'),
  '@aboutcircles/sdk-utils/circlesConverter': resolve(packagesDir, 'utils/src/circlesConverter.ts'),
  '@aboutcircles/sdk-utils/constants': resolve(packagesDir, 'utils/src/constants.ts'),
  '@aboutcircles/sdk-utils/abi': resolve(packagesDir, 'utils/src/abi.ts'),
  '@aboutcircles/sdk-rpc': resolve(packagesDir, 'rpc/src/index.ts'),
  '@aboutcircles/sdk-core': resolve(packagesDir, 'core/src/index.ts'),
  '@aboutcircles/sdk-core/minimal': resolve(packagesDir, 'core/src/contracts/minimal/index.ts'),
  '@aboutcircles/sdk-abis/minimal': resolve(packagesDir, 'abis/src/minimal/index.ts'),
  '@aboutcircles/sdk-transfers': resolve(packagesDir, 'transfers/src/index.ts'),
  '@aboutcircles/sdk-pathfinder': resolve(packagesDir, 'pathfinder/src/index.ts'),
};

// Plugin to resolve workspace packages to source
const workspacePlugin = {
  name: 'workspace-source-resolver',
  setup(build: any) {
    // Handle exact matches
    for (const [pkg, sourcePath] of Object.entries(workspaceAliases)) {
      build.onResolve({ filter: new RegExp(`^${pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }, () => ({
        path: sourcePath,
      }));
    }
  },
};

async function main() {
  const minify = process.argv.includes('--minify');
  const outdir = process.argv.includes('--analyze') ? './dist-analyze' : './dist';

  console.log(`Building invitations package from source (minify: ${minify})...`);

  const result = await build({
    entrypoints: ['./src/index.ts'],
    outdir,
    format: 'esm',
    minify,
    splitting: true,
    plugins: [workspacePlugin],
    external: [], // Bundle everything
  });

  if (!result.success) {
    console.error('Build failed:', result.logs);
    process.exit(1);
  }

  console.log('Build successful!');
  console.log('Output files:');
  for (const output of result.outputs) {
    const sizeKB = (output.size / 1024).toFixed(2);
    console.log(`  ${output.path}: ${sizeKB} KB`);
  }
}

main();
