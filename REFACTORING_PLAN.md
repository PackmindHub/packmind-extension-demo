# Plugin Repository Refactoring Plan

## Overview

Refactor the plugin repository to use separate Nx projects for Hexa (shared), API (NestJS), and Frontend (React routes). This aligns with the new architecture where each target is a separate Nx library project.

## Current Structure

```
packmind-plugin/
├── src/
│   ├── SamplePluginHexa.ts
│   ├── SamplePluginModule.ts
│   └── index.ts
├── dist/
│   └── hexaBundle.cjs
├── manifest.json
├── project.json
└── package.json
```

## Target Structure

```
packmind-plugin/
├── projects/
│   ├── hexa/                      # Nx library (env:node) - Shared Hexa domain
│   │   ├── src/
│   │   │   ├── SamplePluginHexa.ts
│   │   │   └── index.ts
│   │   ├── project.json
│   │   └── tsconfig.json
│   ├── api/                       # Nx library (env:node) - API-specific (NestJS)
│   │   ├── src/
│   │   │   ├── SamplePluginModule.ts
│   │   │   └── index.ts
│   │   ├── project.json
│   │   └── tsconfig.json
│   └── frontend/                  # Nx library (env:browser) - Frontend routes
│       ├── src/
│       │   ├── routes/
│       │   │   └── PluginFeatureRoute.tsx
│       │   └── index.ts
│       ├── project.json
│       └── tsconfig.json
├── dist/
│   ├── hexaBundle.cjs            # Hexa bundle (shared)
│   ├── apiBundle.cjs              # API bundle (NestJS modules)
│   └── frontendBundle.mjs         # Frontend bundle (ESM)
├── manifest.json
├── nx.json
└── package.json
```

## Step-by-Step Refactoring

### Step 1: Create Project Directories

1. Create `projects/hexa/src/` directory
2. Create `projects/api/src/` directory
3. Create `projects/frontend/src/routes/` directory

### Step 2: Move Existing Backend Code

1. Move `src/SamplePluginHexa.ts` → `projects/hexa/src/SamplePluginHexa.ts`
2. Move `src/SamplePluginModule.ts` → `projects/api/src/SamplePluginModule.ts`
3. Create `projects/hexa/src/index.ts` that exports `SamplePluginHexa`
4. Create `projects/api/src/index.ts` that exports `SamplePluginModule`

### Step 3: Create Hexa Project Configuration

Create `projects/hexa/project.json`:

```json
{
  "name": "packmind-plugin-hexa",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "projects/hexa/src",
  "projectType": "library",
  "tags": ["env:node"],
  "targets": {
    "build": {
      "executor": "@nx/esbuild:esbuild",
      "outputs": ["{options.outputPath}"],
      "options": {
        "platform": "node",
        "outputPath": "dist",
        "format": ["cjs"],
        "bundle": true,
        "main": "projects/hexa/src/index.ts",
        "outputFileName": "hexaBundle.cjs",
        "tsConfig": "projects/hexa/tsconfig.json",
        "external": [
          "@packmind/node-utils",
          "@packmind/types",
          "@packmind/logger",
          "typeorm"
        ],
        "generatePackageJson": false
      }
    }
  }
}
```

Create `projects/hexa/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "commonjs",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 4: Create API Project Configuration

Create `projects/api/project.json`:

```json
{
  "name": "packmind-plugin-api",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "projects/api/src",
  "projectType": "library",
  "tags": ["env:node"],
  "targets": {
    "build": {
      "executor": "@nx/esbuild:esbuild",
      "outputs": ["{options.outputPath}"],
      "options": {
        "platform": "node",
        "outputPath": "dist",
        "format": ["cjs"],
        "bundle": true,
        "main": "projects/api/src/index.ts",
        "outputFileName": "apiBundle.cjs",
        "tsConfig": "projects/api/tsconfig.json",
        "external": [
          "@packmind/node-utils",
          "@packmind/types",
          "@packmind/logger",
          "@nestjs/common",
          "reflect-metadata",
          "typeorm"
        ],
        "generatePackageJson": false
      }
    }
  }
}
```

Create `projects/api/tsconfig.json` (same structure as hexa, but pointing to api/src).

### Step 5: Create Frontend Project and Sample Route

Create `projects/frontend/src/routes/PluginFeatureRoute.tsx`:

```typescript
import { useParams } from 'react-router';
import { PMPage, PMBox, PMText } from '@packmind/ui';
import type { LoaderFunctionArgs } from 'react-router';

export async function pluginFeatureLoader({ params }: LoaderFunctionArgs) {
  // Load data for the route
  return { orgSlug: params.orgSlug };
}

export default function PluginFeatureRoute() {
  const { orgSlug } = useParams();
  
  return (
    <PMPage title="Plugin Feature" subtitle="This is a test route from the plugin">
      <PMBox p={4}>
        <PMText>Hello from plugin! Organization: {orgSlug}</PMText>
        <PMText mt={2}>This route was loaded dynamically from the plugin bundle.</PMText>
      </PMBox>
    </PMPage>
  );
}
```

Create `projects/frontend/src/index.ts`:

```typescript
export { default as PluginFeatureRoute, pluginFeatureLoader } from './routes/PluginFeatureRoute';
```

### Step 6: Create Frontend Project Configuration

Create `projects/frontend/project.json`:

```json
{
  "name": "packmind-plugin-frontend",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "projects/frontend/src",
  "projectType": "library",
  "tags": ["env:browser"],
  "targets": {
    "build": {
      "executor": "@nx/esbuild:esbuild",
      "outputs": ["{options.outputPath}"],
      "options": {
        "platform": "browser",
        "outputPath": "dist",
        "format": ["esm"],
        "bundle": true,
        "main": "projects/frontend/src/index.ts",
        "outputFileName": "frontendBundle.mjs",
        "tsConfig": "projects/frontend/tsconfig.json",
        "external": [
          "react",
          "react-dom",
          "react-router",
          "react-router-dom",
          "@packmind/ui",
          "@packmind/types"
        ],
        "generatePackageJson": false
      }
    }
  }
}
```

Create `projects/frontend/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "module": "esnext",
    "lib": ["dom", "dom.iterable", "esnext"],
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "files": [],
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 7: Update Manifest

Update `manifest.json` to the new structure:

```json
{
  "name": "packmind-plugin",
  "version": "0.1.0",
  "id": "packmind-plugin",
  "description": "Sample Packmind plugin with Hexa, API module, and Frontend route",
  "hexa": {
    "bundle": "dist/hexaBundle.cjs",
    "export": "SamplePluginHexa"
  },
  "api": {
    "bundle": "dist/apiBundle.cjs",
    "nestjsModule": "SamplePluginModule"
  },
  "frontend": {
    "bundle": "dist/frontendBundle.mjs",
    "routes": [
      {
        "path": "org/:orgSlug/plugin-feature",
        "component": "PluginFeatureRoute",
        "loader": "pluginFeatureLoader"
      }
    ]
  },
  "dependencies": {
    "packmind": "^1.3.0"
  }
}
```

### Step 8: Update Root Package.json Scripts

Update `package.json` scripts to build all projects:

```json
{
  "scripts": {
    "build": "nx run-many --target=build --projects=packmind-plugin-hexa,packmind-plugin-api,packmind-plugin-frontend",
    "build:hexa": "nx build packmind-plugin-hexa",
    "build:api": "nx build packmind-plugin-api",
    "build:frontend": "nx build packmind-plugin-frontend",
    "watch": "nx run-many --target=build --projects=packmind-plugin-hexa,packmind-plugin-api,packmind-plugin-frontend --watch"
  }
}
```

### Step 9: Update Nx Configuration

Ensure `nx.json` exists and is properly configured. If it doesn't exist, create it:

```json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "defaultBase": "main",
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": [
      "default",
      "!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)"
    ],
    "sharedGlobals": []
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"],
      "cache": true
    }
  }
}
```

### Step 10: Clean Up Old Files

1. Delete old `src/` directory (after moving files)
2. Delete old `project.json` at root (if it exists)
3. Keep `dist/` directory (will be regenerated on build)

### Step 11: Update Dependencies

Ensure `package.json` includes all necessary dependencies:

- For hexa: `@packmind/node-utils`, `@packmind/types`, `@packmind/logger`, `typeorm`
- For api: Same as hexa, plus `@nestjs/common`, `reflect-metadata`
- For frontend: `react`, `react-dom`, `react-router`, `react-router-dom`, `@packmind/ui`, `@packmind/types`

Note: These should be marked as `external` in the build config, so they don't need to be in `package.json` dependencies, but they should be available via the core-deps setup.

### Step 12: Test Build

1. Run `npm run build` to ensure all three projects build successfully
2. Verify that `dist/` contains:
   - `hexaBundle.cjs`
   - `apiBundle.cjs`
   - `frontendBundle.mjs`

## Verification Checklist

- [ ] All three Nx projects created (`hexa`, `api`, `frontend`)
- [ ] `SamplePluginHexa` moved to `projects/hexa/src/`
- [ ] `SamplePluginModule` moved to `projects/api/src/`
- [ ] `PluginFeatureRoute` created in `projects/frontend/src/routes/`
- [ ] All `project.json` files created with correct configuration
- [ ] All `tsconfig.json` files created
- [ ] `manifest.json` updated with new structure
- [ ] `package.json` scripts updated
- [ ] `nx.json` configured
- [ ] Old files cleaned up
- [ ] Build succeeds for all three projects
- [ ] All bundle files generated in `dist/`

## Notes

- The frontend route path `org/:orgSlug/plugin-feature` will be accessible at `/org/{orgSlug}/plugin-feature` in the Packmind frontend
- All external dependencies are marked as external in the build config, so they won't be bundled
- The frontend bundle uses ESM format (`.mjs`) for better compatibility with Vite
- The hexa and api bundles use CommonJS format (`.cjs`) for Node.js compatibility



