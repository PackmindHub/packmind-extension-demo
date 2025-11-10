# Packmind Plugin

A sample Packmind plugin demonstrating how to create a plugin with a Hexa domain.

## Setup

### 1. Build Core Packages in Main Repository

First, ensure the core packages are built in the main Packmind repository:

```bash
cd /path/to/packmind
nx build node-utils
nx build types
nx build logger
```

### 2. Setup Core Dependencies

Copy `@packmind/node-utils`, `@packmind/types`, and `@packmind/logger` from the main Packmind repository:

```bash
npm run setup-core-deps
```

This script:
- Copies built packages from the main repository (`../packmind/dist/packages/*`)
- Places them in `core-deps/` directory
- Requires the main repository packages to be built first

**Note**: You can set `PACKMIND_MAIN_REPO` environment variable to point to a different location:
```bash
PACKMIND_MAIN_REPO=/path/to/packmind npm run setup-core-deps
```

### 3. Install Dependencies

```bash
npm install
```

The `package.json` uses `file:` protocol to reference the copied packages, so they must exist before running `npm install`.

### 3. Build the Plugin

```bash
npm run build
```

This creates `dist/hexaBundle.cjs` which contains the bundled Hexa class.

## Development

### Watch Mode

```bash
npm run watch
```

This will rebuild the plugin bundle when source files change.

### Testing in Packmind

1. In the main Packmind repository, create a symlink to this plugin:
   ```bash
   cd /path/to/packmind
   ln -s /path/to/packmind-plugin plugins/packmind-plugin
   ```

2. The plugin will be automatically loaded at runtime from `plugins/packmind-plugin/`

## Plugin Structure

```
packmind-plugin/
  src/
    SamplePluginHexa.ts    # The Hexa class
    index.ts                # Exports
  manifest.json            # Plugin metadata
  dist/
    hexaBundle.cjs         # Built bundle (created by build)
  core-deps/               # Copied core dependencies (created by setup-core-deps)
```

## Manifest

The `manifest.json` file defines:
- Plugin name and version
- Backend bundle location and export name
- Dependencies

## Building the Bundle

The build process:
- Bundles `src/index.ts` and dependencies
- Marks `@packmind/node-utils` and `@packmind/types` as external (not bundled)
- Outputs CommonJS format to `dist/hexaBundle.cjs`
- Exports `SamplePluginHexa` class

## Notes

- Core packages (`@packmind/node-utils`, `@packmind/types`) are marked as external
- They will be resolved at runtime from the Packmind application context
- The plugin bundle only contains plugin-specific code

