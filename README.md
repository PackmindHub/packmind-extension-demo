# Packmind Plugin

A sample Packmind plugin demonstrating how to create a plugin with Hexa domain, NestJS API, and React frontend components.

## Quick Start

### 1. Initial Setup

```bash
# In the main Packmind repository
cd /path/to/packmind
npm install
nx build node-utils types logger ui

# In the plugin repository
cd /path/to/packmind-plugin
npm install

# Build the plugin
npm run build
```

### 2. Link Plugin to Main Repository

```bash
# From the main repository root
npm run setup-plugin-dev /path/to/packmind-plugin
```

This single command will:
- Check and build core packages if needed
- Set up core dependencies in the plugin
- Copy the plugin to `plugins/` directory

### 3. Start Development

```bash
# In the main repository
nx serve frontend  # For frontend development
nx serve api       # For backend development
```

The plugin will be automatically loaded at runtime!

## Plugin Architecture

The plugin is organized into three separate projects:

```
packmind-plugin/
├── projects/
│   ├── hexa/          # Hexagonal domain logic
│   ├── api/           # NestJS API controllers and modules
│   └── frontend/      # React components, routes, and UI elements
├── manifest.json      # Plugin metadata and configuration
├── routes.json        # Auto-generated route paths (gitignored)
└── dist/              # Built bundles
```

## Adding New Elements to the Plugin

### Adding a New Route

1. **Create the route component** in `projects/frontend/src/routes/`:

```typescript
// projects/frontend/src/routes/MyNewRoute.tsx
import { PMBox, PMHeading, PMText } from '@packmind/ui';
import type { LoaderFunctionArgs } from 'react-router';

export async function myNewRouteLoader(args: LoaderFunctionArgs) {
  // Load data for the route
  return { message: 'Hello from plugin route!' };
}

export default function MyNewRoute() {
  return (
    <PMBox p={6}>
      <PMHeading>My New Route</PMHeading>
      <PMText>This is a new plugin route!</PMText>
    </PMBox>
  );
}
```

2. **Export the route** in `projects/frontend/src/index.ts`:

```typescript
// Add to getPluginRoutes()
export function getPluginRoutes(): PluginRoute[] {
  return [
    // ... existing routes
    {
      path: '/org/:orgSlug/my-new-route',
      Component: () => 
        import('./routes/MyNewRoute').then(module => ({
          default: module.default
        })),
      loader: async (args: LoaderFunctionArgs) => {
        const module = await import('./routes/MyNewRoute');
        return module.myNewRouteLoader(args);
      },
    },
  ];
}

// Add to getPluginRoutePaths() for build-time route extraction
export function getPluginRoutePaths(): string[] {
  return [
    '/org/:orgSlug/plugin-feature',
    '/org/:orgSlug/my-new-route',  // Add your new route here
  ];
}
```

3. **Rebuild the plugin**:

```bash
npm run build
```

The route will be automatically discovered and integrated into the main application!

### Adding a Navigation Item to the Sidebar

Add navigation items via the `getPluginOutlets()` function:

```typescript
// In projects/frontend/src/index.ts
import { LuNewIcon } from 'react-icons/lu';  // Or any icon library

export function getPluginOutlets(): PluginOutlets {
  return {
    'sidebar-nav': [
      {
        data: [
          {
            path: '/org/:orgSlug/plugin-feature',
            label: 'Plugin Feature',
            icon: React.createElement(LuPuzzle),
            exact: false,
          },
          // Add your new navigation item
          {
            path: '/org/:orgSlug/my-new-route',
            label: 'My New Feature',
            icon: React.createElement(LuNewIcon),
            exact: false,
          },
        ],
      },
    ],
    // ... other outlets
  };
}
```

Navigation items will appear in the sidebar below the "Deployments" section.

### Adding a Dashboard Widget

1. **Create the widget component**:

```typescript
// projects/frontend/src/components/MyDashboardWidget.tsx
import { PMBox, PMHeading, PMText, PMVStack } from '@packmind/ui';

export function MyDashboardWidget() {
  return (
    <PMBox
      p={6}
      borderRadius="md"
      borderWidth="1px"
      borderColor="border.secondary"
      bgColor="background.secondary"
    >
      <PMVStack gap={4} align="stretch">
        <PMHeading size="md">My Dashboard Widget</PMHeading>
        <PMText>
          This widget appears on the organization dashboard!
        </PMText>
      </PMVStack>
    </PMBox>
  );
}
```

2. **Export it in the outlets**:

```typescript
// In projects/frontend/src/index.ts
export function getPluginOutlets(): PluginOutlets {
  return {
    // ... other outlets
    'dashboard-content': [
      {
        // Export a factory function (not lazy-wrapped)
        component: () =>
          import('./components/PluginDashboardWidget').then((module) => ({
            default: module.PluginDashboardWidget,
          })),
      },
      // Add your new widget
      {
        component: () =>
          import('./components/MyDashboardWidget').then((module) => ({
            default: module.MyDashboardWidget,
          })),
      },
    ],
  };
}
```

The widget will automatically appear on the organization dashboard page!

### Adding a Backend API Endpoint

1. **Create a controller** in `projects/api/src/`:

```typescript
// projects/api/src/MyNewController.ts
import { Controller, Get } from '@nestjs/common';

@Controller('my-new-endpoint')
export class MyNewController {
  @Get()
  getData() {
    return { message: 'Hello from plugin API!' };
  }
}
```

2. **Register it in the module**:

```typescript
// projects/api/src/SamplePluginModule.ts
import { MyNewController } from './MyNewController';

@Module({
  controllers: [SamplePluginController, MyNewController],  // Add here
  // ...
})
export class SamplePluginModule {}
```

3. **Rebuild the plugin**:

```bash
npm run build
```

The endpoint will be available at `/my-new-endpoint` when the API server is running.

### Adding Hexa Domain Logic

1. **Create a new use case** in `projects/hexa/src/`:

```typescript
// projects/hexa/src/MyNewUseCase.ts
import { AbstractMemberUseCase } from '@packmind/node-utils';

export class MyNewUseCase extends AbstractMemberUseCase<
  { input: string },
  { output: string }
> {
  async executeForMembers(command: { input: string }) {
    return { output: `Processed: ${command.input}` };
  }
}
```

2. **Register it in the Hexa class**:

```typescript
// projects/hexa/src/SamplePluginHexa.ts
import { MyNewUseCase } from './MyNewUseCase';

export class SamplePluginHexa extends BaseHexa {
  // ... existing code
  
  getMyNewUseCase(): MyNewUseCase {
    return this.getUseCase(MyNewUseCase);
  }
}
```

3. **Export it**:

```typescript
// projects/hexa/src/index.ts
export { MyNewUseCase } from './MyNewUseCase';
```

## Development Workflow

### Making Changes

1. **Edit plugin code** in `projects/`
2. **Rebuild plugin**: `npm run build` (in plugin repo)
3. **Frontend hot-reloads** automatically (if using `nx serve frontend`)

### Updating Core Dependencies

If you update core Packmind packages:

1. **Rebuild core packages** in main repo:
   ```bash
   nx build node-utils types logger ui
   ```

2. **Update plugin dependencies**:
   ```bash
   # In plugin repo
   npm run setup-core-deps
   ```

3. **Rebuild plugin**:
   ```bash
   npm run build
   ```

### Testing

See [TESTING.md](./TESTING.md) for detailed testing instructions.

## Plugin Structure

```
packmind-plugin/
├── projects/
│   ├── hexa/              # Hexagonal domain
│   │   └── src/
│   │       ├── SamplePluginHexa.ts
│   │       └── index.ts
│   ├── api/               # NestJS API
│   │   └── src/
│   │       ├── SamplePluginModule.ts
│   │       ├── SamplePluginController.ts
│   │       └── index.ts
│   └── frontend/           # React frontend
│       └── src/
│           ├── routes/     # Route components
│           ├── components/ # Reusable components
│           └── index.ts    # Main exports (routes, outlets)
├── manifest.json           # Plugin metadata
├── routes.json            # Auto-generated (gitignored)
├── dist/                  # Built bundles
│   ├── hexaBundle.cjs
│   ├── apiBundle.cjs
│   └── frontendBundle.mjs
└── core-deps/             # Copied core dependencies
```

## Manifest Configuration

The `manifest.json` defines:

- **Plugin metadata**: name, version, description
- **Backend bundles**: Hexa and API bundle locations
- **Frontend configuration**: Route extraction settings

See `manifest.json` for the current structure.

## Available Outlets

Plugins can inject content into these predefined outlets:

- **`sidebar-nav`**: Add navigation items to the sidebar
  - Format: Array of `PluginNavigationItem` objects
  - Appears below "Deployments" section

- **`dashboard-content`**: Add widgets to the organization dashboard
  - Format: Array of component factory functions
  - Components are wrapped in `Suspense` for lazy loading

## Building the Plugin

```bash
# Build all bundles
npm run build

# Build specific bundle
npm run build:hexa
npm run build:api
npm run build:frontend
```

The build process:
- Bundles source code with dependencies
- Marks `@packmind/*` packages as external (resolved at runtime)
- Outputs appropriate formats (CommonJS for backend, ESM for frontend)
- Extracts route paths to `routes.json` (for frontend)

## Documentation

- **[SETUP.md](./SETUP.md)**: Complete setup guide from scratch
- **[TESTING.md](./TESTING.md)**: How to test the plugin
- **[REFACTORING_PLAN.md](./REFACTORING_PLAN.md)**: Architecture details

## Notes

- Core packages (`@packmind/node-utils`, `@packmind/types`, etc.) are marked as external
- They are resolved at runtime from the Packmind application context
- Plugin bundles only contain plugin-specific code
- Frontend routes are automatically merged with main app routes
- Plugin outlets are loaded at runtime via `PluginProvider`
