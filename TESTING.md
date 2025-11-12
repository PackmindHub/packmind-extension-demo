# Testing the Packmind Plugin

## Prerequisites

1. **Plugin is built**: All bundles must be built in the plugin repository
   ```bash
   cd /home/croquette/Code/packmind-plugin
   npm run build
   ```

2. **Plugin is linked**: The plugin must be symlinked or copied to the main repository's `plugins/` directory
   ```bash
   cd /home/croquette/Code/packmind
   # If not already linked:
   ln -s /home/croquette/Code/packmind-plugin plugins/packmind-plugin
   ```

3. **Verify plugin structure**:
   ```bash
   ls -la plugins/packmind-plugin/
   # Should show:
   # - manifest.json
   # - dist/
   #   - hexaBundle.cjs
   #   - apiBundle.cjs
   #   - frontendBundle.mjs
   ```

## Testing Backend (Hexa + API)

### 1. Start the API Server

```bash
cd /home/croquette/Code/packmind
nx serve api
```

### 2. Check Logs for Plugin Loading

Look for log messages indicating the plugin was loaded:
- `[HexaPluginLoader] info: Loading plugins from: ...`
- `[HexaPluginLoader] info: Successfully loaded plugin: packmind-plugin`
- `[PluginModulesModule] info: Found X plugin(s) with NestJS modules`
- `[SamplePluginHexa] info: SamplePluginHexa constructed`
- `[SamplePluginHexa] info: SamplePluginHexa initialized`

### 3. Test the API Endpoint

The plugin exposes a controller at `/sample-plugin/health`:

```bash
curl http://localhost:3000/sample-plugin/health
# Expected response:
# {"status":"ok","message":"Sample plugin is running"}
```

### 4. Verify Hexa is Registered

Check the API logs to see if the Hexa was initialized. The plugin Hexa should be registered alongside other Hexas.

## Testing Frontend

### 1. Start the Frontend Dev Server

```bash
cd /home/croquette/Code/packmind
nx serve frontend
```

### 2. Check Build Logs

The Vite plugin should generate route files for the plugin:
- Look for messages about generating plugin routes
- Check `apps/frontend/app/routes/` for generated route files like `org.$orgSlug.plugin-feature.tsx`

### 3. Navigate to the Plugin Route

1. Open the frontend in your browser (usually `http://localhost:4200`)
2. Sign in to your account
3. Navigate to: `http://localhost:4200/org/{your-org-slug}/plugin-feature`
4. You should see the plugin route page with:
   - Title: "Plugin Feature"
   - Subtitle: "This is a test route from the plugin"
   - Content showing the organization slug

### 4. Verify Route Loading

Check the browser console and network tab:
- The plugin bundle should be loaded dynamically
- No errors should appear in the console
- The route should render correctly

## Troubleshooting

### Plugin Not Loading

1. **Check plugin directory**:
   ```bash
   ls -la plugins/packmind-plugin/
   ```

2. **Verify manifest.json**:
   ```bash
   cat plugins/packmind-plugin/manifest.json
   ```

3. **Check bundle files exist**:
   ```bash
   ls -lh plugins/packmind-plugin/dist/
   ```

4. **Check API logs** for error messages about plugin loading

### Frontend Route Not Appearing

1. **Check Vite plugin logs** during build
2. **Verify route file was generated**:
   ```bash
   ls -la apps/frontend/app/routes/org.*.plugin-feature.tsx
   ```

3. **Check browser console** for import errors

### API Endpoint Not Working

1. **Check NestJS module was loaded**:
   - Look for `[PluginModulesModule]` logs
   - Verify controller was registered

2. **Check route registration**:
   ```bash
   # The endpoint should be available at:
   curl http://localhost:3000/sample-plugin/health
   ```

## Development Workflow

### Watch Mode

For active development, use watch mode:

**Plugin repository**:
```bash
cd /home/croquette/Code/packmind-plugin
npm run watch
```

**Main repository**:
```bash
# Terminal 1: API
cd /home/croquette/Code/packmind
nx serve api

# Terminal 2: Frontend
cd /home/croquette/Code/packmind
nx serve frontend
```

### Making Changes

1. Edit plugin code in `packmind-plugin/projects/`
2. Watch mode will rebuild bundles automatically
3. Restart the API server to reload plugins (plugins are loaded at startup)
4. Frontend will hot-reload automatically (Vite plugin regenerates routes)

## Expected Results

### ✅ Backend Success Indicators

- API logs show plugin loaded successfully
- `/sample-plugin/health` endpoint returns 200 OK
- Hexa initialization logs appear
- No errors in API startup logs

### ✅ Frontend Success Indicators

- Route file generated in `app/routes/`
- Plugin route accessible at `/org/:orgSlug/plugin-feature`
- Page renders with plugin content
- No console errors
- Dynamic import of plugin bundle succeeds


