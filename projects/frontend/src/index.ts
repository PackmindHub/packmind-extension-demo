export { default as PluginFeatureRoute, pluginFeatureLoader } from './routes/PluginFeatureRoute';

import { lazy } from 'react';
import * as React from 'react';
import type { LoaderFunctionArgs } from 'react-router';
import type { PluginOutlets, PluginNavigationItem } from '@packmind/types';
import { LuPuzzle } from 'react-icons/lu';

/**
 * Route configuration type (compatible with React Router v7 RouteConfig)
 * We define this locally to avoid depending on @react-router/dev which is not available in plugins
 */
type PluginRoute = {
  path: string;
  // Component is a factory function that returns a promise resolving to a component module
  Component: () => Promise<{ default: React.ComponentType }>;
  loader?: (args: LoaderFunctionArgs) => Promise<unknown>;
};

/**
 * Get route paths only (for build-time route module generation).
 * This can be called at build time without loading components/dependencies.
 */
export function getPluginRoutePaths(): string[] {
  return ['/org/:orgSlug/plugin-feature'];
}

/**
 * Export route configuration for this plugin.
 * Returns route array that can be merged with flatRoutes().
 * 
 * Note: We create route objects manually since components are in the bundle.
 */
export function getPluginRoutes(): PluginRoute[] {
  return [
    {
      path: '/org/:orgSlug/plugin-feature',
      // Return the component factory function, not wrapped in lazy()
      // The route module will wrap it in lazy() when needed
      Component: () => 
        import('./routes/PluginFeatureRoute').then(module => ({
          default: module.default
        })),
      loader: async (args: LoaderFunctionArgs) => {
        const module = await import('./routes/PluginFeatureRoute');
        return module.pluginFeatureLoader(args);
      },
    },
  ];
}

/**
 * Export outlet content for this plugin.
 * Returns outlet content organized by outlet name.
 */
export function getPluginOutlets(): PluginOutlets {
  const navItem: PluginNavigationItem = {
    path: '/org/:orgSlug/plugin-feature',
    label: 'Plugin Feature',
    icon: React.createElement(LuPuzzle),
    exact: false,
  };

  return {
    'sidebar-nav': [
      {
        data: [navItem],
      },
    ],
    'dashboard-content': [
      {
        // Export a factory function that returns the component module
        // The main app will wrap it in lazy() if needed
        component: () =>
          import('./components/PluginDashboardWidget').then((module) => ({
            default: module.PluginDashboardWidget,
          })),
      },
    ],
  };
}
