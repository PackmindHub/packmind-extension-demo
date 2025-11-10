#!/usr/bin/env node

/**
 * Script to copy @packmind/node-utils, @packmind/types, and @packmind/logger
 * from the main repository to a local core-deps directory for plugin development.
 *
 * This allows the plugin to resolve these packages without needing npm link.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PLUGIN_ROOT = path.resolve(__dirname, '..');
const MAIN_REPO_PATH = process.env.PACKMIND_MAIN_REPO || path.resolve(PLUGIN_ROOT, '..', 'packmind');
const CORE_DEPS_DIR = path.join(PLUGIN_ROOT, 'core-deps');

const PACKAGES_TO_COPY = [
  { name: '@packmind/node-utils', source: 'packages/node-utils', dist: 'dist/packages/node-utils' },
  { name: '@packmind/types', source: 'packages/types', dist: 'dist/packages/types' },
  { name: '@packmind/logger', source: 'packages/logger', dist: 'dist/packages/logger' },
];

function log(message) {
  console.log(`[setup-core-deps] ${message}`);
}

function error(message) {
  console.error(`[setup-core-deps] ERROR: ${message}`);
  process.exit(1);
}

function checkMainRepo() {
  if (!fs.existsSync(MAIN_REPO_PATH)) {
    error(`Main repository not found at: ${MAIN_REPO_PATH}`);
    error(`Set PACKMIND_MAIN_REPO environment variable to point to the main repo`);
  }

  const packageJsonPath = path.join(MAIN_REPO_PATH, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    error(`package.json not found in main repository at: ${MAIN_REPO_PATH}`);
  }

  log(`Using main repository at: ${MAIN_REPO_PATH}`);
}

function checkPackagesBuilt() {
  const missingPackages = [];

  for (const pkg of PACKAGES_TO_COPY) {
    const distPath = path.join(MAIN_REPO_PATH, pkg.dist);
    if (!fs.existsSync(distPath)) {
      missingPackages.push(pkg.name);
    }
  }

  if (missingPackages.length > 0) {
    log(`The following packages need to be built in the main repository:`);
    missingPackages.forEach(name => log(`  - ${name}`));
    log(`\nRun in the main repository:`);
    missingPackages.forEach(name => {
      const pkgInfo = PACKAGES_TO_COPY.find(p => p.name === name);
      if (pkgInfo) {
        const nxProject = name.replace('@packmind/', '');
        log(`  nx build ${nxProject}`);
      }
    });
    error(`Please build the required packages first`);
  }
}

function copyPackage(pkg) {
  const sourcePath = path.join(MAIN_REPO_PATH, pkg.dist);
  const targetPath = path.join(CORE_DEPS_DIR, pkg.name.replace('@packmind/', ''));

  log(`Copying ${pkg.name}...`);

  // Remove existing copy
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }

  // Create target directory
  fs.mkdirSync(targetPath, { recursive: true });

  // Copy all files
  copyRecursiveSync(sourcePath, targetPath);

  log(`  ✓ Copied to ${targetPath}`);
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function updatePackageJson() {
  // No need to update package.json anymore - it uses file: protocol
  // Just verify the packages exist
  const nodeUtilsPath = path.join(CORE_DEPS_DIR, 'node-utils', 'package.json');
  const typesPath = path.join(CORE_DEPS_DIR, 'types', 'package.json');
  const loggerPath = path.join(CORE_DEPS_DIR, 'logger', 'package.json');

  if (!fs.existsSync(nodeUtilsPath)) {
    error(`@packmind/node-utils package.json not found at ${nodeUtilsPath}`);
  }

  if (!fs.existsSync(typesPath)) {
    error(`@packmind/types package.json not found at ${typesPath}`);
  }

  if (!fs.existsSync(loggerPath)) {
    error(`@packmind/logger package.json not found at ${loggerPath}`);
  }

  log(`  ✓ Package.json files verified`);
}

function main() {
  log('Setting up core dependencies...');
  log('');

  checkMainRepo();
  checkPackagesBuilt();

  // Create core-deps directory
  if (!fs.existsSync(CORE_DEPS_DIR)) {
    fs.mkdirSync(CORE_DEPS_DIR, { recursive: true });
  }

  // Copy packages
  log('Copying packages from main repository...');
  PACKAGES_TO_COPY.forEach(copyPackage);

  log('');
  log('Verifying packages...');
  updatePackageJson();
  
  log('');
  log('Next step: Run "npm install" to install dependencies');

  log('');
  log('✓ Core dependencies setup complete!');
  log('');
  log('Note: Run this script again after building packages in the main repository.');
}

main();

