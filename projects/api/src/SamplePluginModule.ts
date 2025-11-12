import { Module } from '@nestjs/common';
import { SamplePluginController } from './SamplePluginController';

@Module({
  controllers: [SamplePluginController],
  providers: [],
  exports: [],
})
export class SamplePluginModule {}


