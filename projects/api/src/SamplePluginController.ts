import { Controller, Get } from '@nestjs/common';

@Controller('sample-plugin')
export class SamplePluginController {
  @Get('health')
  health() {
    return { status: 'ok', message: 'Sample plugin is running' };
  }
}
