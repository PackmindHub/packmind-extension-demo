/**
 * Extracts route paths from getPluginRoutes() and writes them to routes.json
 * This script runs after the frontend build to generate route paths for build-time route module generation.
 */

const { writeFileSync, existsSync, readFileSync } = require('fs');
const { resolve } = require('path');

// Resolve paths relative to plugin root (parent of scripts/)
// __dirname is the directory where this script file is located
const pluginRoot = resolve(__dirname, '..');
const routesPath = resolve(pluginRoot, 'routes.json');
const sourcePath = resolve(pluginRoot, 'projects/frontend/src/index.ts');

// Try to import from source TypeScript file (using tsx or ts-node if available)
// Otherwise fall back to bundle
const bundlePath = resolve(pluginRoot, 'dist/frontendBundle.mjs');

(async () => {
  try {
    let routes;
    
    // First, try to extract paths from getPluginRoutePaths() by parsing the source file
    // This avoids any import/dependency issues
    if (existsSync(sourcePath)) {
      try {
        const sourceContent = readFileSync(sourcePath, 'utf-8');
        
        // Look for getPluginRoutePaths() function and extract the array
        const routePathsMatch = sourceContent.match(/getPluginRoutePaths\(\):\s*string\[\]\s*\{[^}]*return\s*\[([^\]]+)\]/s);
        if (routePathsMatch) {
          // Extract paths from the array (handles both single and multi-line)
          const pathsString = routePathsMatch[1];
          const paths = pathsString
            .split(',')
            .map(p => p.trim().replace(/^['"]|['"]$/g, ''))
            .filter(p => p);
          
          if (paths.length > 0) {
            routes = paths.map(path => ({ path }));
            console.log(`[extract-routes] Successfully extracted ${paths.length} route path(s) from getPluginRoutePaths()`);
          }
        }
      } catch (parseError) {
        console.log(`[extract-routes] Failed to parse source file: ${parseError.message}`);
      }
    }
    
    // If parsing failed, try importing from bundle (may fail due to external deps)
    if (!routes) {
      if (!existsSync(bundlePath)) {
        console.warn(`[extract-routes] Bundle not found at ${bundlePath}, skipping route extraction`);
        process.exit(0);
      }
      
      try {
        const bundleUrl = bundlePath.startsWith('/') 
          ? `file://${bundlePath}`
          : bundlePath;
        console.log(`[extract-routes] Attempting to import bundle from: ${bundleUrl}`);
        // @ts-expect-error - Dynamic import
        const bundle = await import(bundleUrl);
        
        if (bundle.getPluginRoutePaths && typeof bundle.getPluginRoutePaths === 'function') {
          const paths = bundle.getPluginRoutePaths();
          routes = paths.map(path => ({ path }));
          console.log(`[extract-routes] Successfully loaded route paths from bundle`);
        } else if (bundle.getPluginRoutes && typeof bundle.getPluginRoutes === 'function') {
          routes = bundle.getPluginRoutes();
          console.log(`[extract-routes] Successfully loaded routes from bundle`);
        } else {
          console.warn('[extract-routes] getPluginRoutePaths() or getPluginRoutes() not found in bundle');
          process.exit(0);
        }
      } catch (bundleError) {
        console.warn(`[extract-routes] Bundle import failed: ${bundleError.message}`);
        console.warn('[extract-routes] Could not extract routes. Make sure getPluginRoutePaths() is defined in the source file.');
        process.exit(0);
      }
    }

    if (!Array.isArray(routes)) {
      console.warn('[extract-routes] getPluginRoutes() did not return an array');
      process.exit(0);
    }

    // Extract just the paths from the routes
    const routePaths = routes
      .map((route) => {
        if (typeof route === 'object' && route !== null && 'path' in route) {
          return route.path;
        }
        return null;
      })
      .filter((path) => path !== null);

    if (routePaths.length === 0) {
      console.warn('[extract-routes] No routes found in getPluginRoutes()');
      process.exit(0);
    }

    // Write route paths to routes.json
    // The actual components/loaders will come from getPluginRoutes() at runtime
    const routesData = {
      routes: routePaths.map((path) => ({
        path: path,
        // component and loader are not needed - they come from getPluginRoutes()
      })),
    };

    writeFileSync(routesPath, JSON.stringify(routesData, null, 2) + '\n');
    console.log(
      `[extract-routes] Extracted ${routePaths.length} route path(s) from getPluginRoutes() to routes.json`,
    );
  } catch (error) {
    console.error('[extract-routes] Error details:', error.message, error.code, error.stack);
    if (error.code === 'MODULE_NOT_FOUND' || error.code === 'ERR_MODULE_NOT_FOUND') {
      console.warn('[extract-routes] Bundle not found, skipping route extraction');
      process.exit(0);
    }
    console.error('[extract-routes] Failed to extract routes:', error);
    process.exit(1);
  }
})();

