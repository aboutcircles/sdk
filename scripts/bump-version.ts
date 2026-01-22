import { $ } from "bun";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const versionType = process.argv[2] || "patch";
const packagesDir = resolve(__dirname, "../packages");

// Read all package.json files
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
  "runner",
  "sdk",
];

// Get current version from main SDK
const sdkPackage = JSON.parse(
  readFileSync(resolve(packagesDir, "sdk/package.json"), "utf-8")
);
const currentVersion = sdkPackage.version;

// Calculate new version
const [major, minor, patch] = currentVersion.split(".").map(Number);
let newVersion: string;

switch (versionType) {
  case "major":
    newVersion = `${major + 1}.0.0`;
    break;
  case "minor":
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case "patch":
  default:
    newVersion = `${major}.${minor}.${patch + 1}`;
}

console.log(`Bumping version from ${currentVersion} to ${newVersion}`);

// Update all package.json files
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
