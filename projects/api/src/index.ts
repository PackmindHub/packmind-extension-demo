// Ensure reflect-metadata is available for decorators to work properly
// This is needed when the bundle is loaded dynamically
import 'reflect-metadata';

export { SamplePluginModule } from './SamplePluginModule';
export { SamplePluginController } from './SamplePluginController';
