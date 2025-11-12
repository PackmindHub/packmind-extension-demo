# Plugin Setup Guide

Complete setup instructions for setting up the Packmind plugin system from scratch.

## Prerequisites

- Node.js (version specified in `.nvmrc` of main repo)
- npm
- Git

## Step 1: Clone Main Packmind Repository

```bash
# Clone the main Packmind monorepo
git clone <packmind-repo-url>
cd packmind

# Install dependencies
npm install

# Build core packages that plugins depend on
nx build node-utils
nx build types
nx build logger
nx build ui
```

## Step 2: Clone Plugin Repository

```bash
# In a separate directory, clone the plugin repository
cd ..
git clone <plugin-repo-url>
cd packmind-plugin

# Install dependencies
npm install
```

**Note:** You don't need to run `setup-core-deps` manually anymore - it's done automatically by `setup-plugin-dev` in the next step.

## Step 3: Build the Plugin

```bash
# Build all plugin bundles (hexa, api, frontend)
npm run build

# This will:
# - Build hexaBundle.cjs
# - Build apiBundle.cjs  
# - Build frontendBundle.mjs
# - Extract route paths to routes.json
```

## Step 4: Set Up Plugin in Main Repository

```bash
# From the main repo root
cd packmind

# Single command that does everything:
npm run setup-plugin-dev /path/to/packmind-plugin

# This will automatically:
# 1. Check and build core packages if needed (node-utils, types, logger, ui)
# 2. Set up core dependencies in the plugin repo (runs setup-core-deps)
# 3. Copy the plugin to plugins/ directory
```

**That's it!** One command handles everything.

## Step 5: Verify Plugin Structure

The plugin should have this structure in the main repo:

```
packmind/
  plugins/
    packmind-plugin/
      manifest.json          # Plugin metadata
      routes.json            # Route paths (auto-generated)
      dist/
        hexaBundle.cjs       # Hexa bundle
        apiBundle.cjs        # API bundle
        frontendBundle.mjs   # Frontend bundle
```

## Step 6: Build/Run Frontend

```bash
# From the main repo root
cd packmind

# Build frontend (will discover and load plugins)
nx build frontend

# Or run in development mode
nx serve frontend
```

## Step 7: Test Plugin Route

Once the frontend is running:

1. Navigate to: `http://localhost:4200/org/myorg/plugin-feature`
2. You should see:
   - The plugin route content
   - The sidebar (from protected layout)
   - Authentication guard working

## Troubleshooting

### Plugin routes not appearing

1. Check that `routes.json` exists in the plugin directory
2. Verify the plugin is in `plugins/` or `dist/plugins/`
3. Check frontend build logs for plugin loading messages

### Core dependencies not found

1. The `setup-plugin-dev` script should handle this automatically
2. If issues persist, manually run: `npm run setup-core-deps` in the plugin repo
3. Verify `core-deps/` directory exists in plugin repo

### Route module generation errors

1. Check that `frontendBundle.mjs` exists in plugin's `dist/` directory
2. Verify `getPluginRoutePaths()` is defined in `projects/frontend/src/index.ts`
3. Check that `routes.json` was generated (run `npm run build:frontend` again)

## Development Workflow

When developing the plugin:

1. **Make changes to plugin code**
2. **Rebuild plugin**: `npm run build` (in plugin repo)
3. **Frontend will hot-reload** (if using `nx serve frontend`)

When developing core packages:

1. **Make changes to core packages** (in main repo)
2. **Rebuild core packages**: `nx build node-utils` etc.
3. **Update plugin core-deps**: `npm run setup-core-deps` (in plugin repo)
4. **Rebuild plugin**: `npm run build` (in plugin repo)

## Quick Reference

```bash
# Main repo - Initial setup
git clone <packmind-repo-url>
cd packmind
npm install

# Plugin repo - Initial setup
git clone <plugin-repo-url>
cd packmind-plugin
npm install

# Main repo - One command to set up everything
npm run setup-plugin-dev /path/to/packmind-plugin

# Plugin repo - Build plugin
npm run build

# Main repo - Run frontend
nx serve frontend
```

