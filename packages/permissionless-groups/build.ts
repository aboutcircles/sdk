/**
 * Custom build script for permissionless-groups package
 * Builds from source files to deduplicate workspace dependencies
 */
import { build } from 'bun';
import { resolve, dirname } from 'path';

const packagesDir = resolve(dirname(import.meta.path), '..');

const workspaceAliases: Record<string, string> = {
  '@aboutcircles/sdk-types': resolve(packagesDir, 'types/src/index.ts'),
  '@aboutcircles/sdk-abis': resolve(packagesDir, 'abis/src/index.ts'),
  '@aboutcircles/sdk-abis/scoreGatedMintPolicy': resolve(packagesDir, 'abis/src/scoreGatedMintPolicy.ts'),
  '@aboutcircles/sdk-utils': resolve(packagesDir, 'utils/src/index.ts'),
  '@aboutcircles/sdk-utils/abi': resolve(packagesDir, 'utils/src/abi.ts'),
  '@aboutcircles/sdk-utils/constants': resolve(packagesDir, 'utils/src/constants.ts'),
  '@aboutcircles/sdk-core': resolve(packagesDir, 'core/src/index.ts'),
};

const workspacePlugin = {
  name: 'workspace-source-resolver',
  setup(build: any) {
    for (const [pkg, sourcePath] of Object.entries(workspaceAliases)) {
      build.onResolve(
        { filter: new RegExp(`^${pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) },
        () => ({ path: sourcePath })
      );
    }
  },
};

async function main() {
  const minify = process.argv.includes('--minify');
  const outdir = process.argv.includes('--analyze') ? './dist-analyze' : './dist';

  console.log(`Building permissionless-groups (minify: ${minify})...`);

  const result = await build({
    entrypoints: ['./src/index.ts'],
    outdir,
    format: 'esm',
    minify,
    splitting: true,
    plugins: [workspacePlugin],
    external: [],
  });

  if (!result.success) {
    console.error('Build failed:', result.logs);
    process.exit(1);
  }

  console.log('Build successful!');
  for (const output of result.outputs) {
    const sizeKB = (output.size / 1024).toFixed(2);
    console.log(`  ${output.path}: ${sizeKB} KB`);
  }
}

main();
