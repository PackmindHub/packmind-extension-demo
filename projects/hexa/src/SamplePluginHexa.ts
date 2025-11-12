import { BaseHexa, BaseHexaOpts, HexaRegistry } from '@packmind/node-utils';
import { DataSource } from 'typeorm';

const origin = 'SamplePluginHexa';

/**
 * SamplePluginHexa - A sample plugin Hexa for testing the plugin system.
 *
 * This is a minimal example of a plugin Hexa that extends BaseHexa.
 */
export class SamplePluginHexa extends BaseHexa<BaseHexaOpts, void> {
  constructor(dataSource: DataSource, opts?: Partial<BaseHexaOpts>) {
    super(dataSource, opts);
    this.logger.info('SamplePluginHexa constructed');
  }

  async initialize(registry: HexaRegistry): Promise<void> {
    this.logger.info('SamplePluginHexa initialized');
    // Plugin can access other hexas via registry if needed
    // Example: const gitHexa = registry.get(GitHexa);
  }

  getAdapter(): void {
    throw new Error('SamplePluginHexa does not expose an adapter');
  }

  getPortName(): string {
    throw new Error('SamplePluginHexa does not expose a port');
  }

  destroy(): void {
    this.logger.info('SamplePluginHexa destroyed');
  }
}

