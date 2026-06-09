import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  root() {
    return {
      name: 'Consulting Platform API',
      version: '0.1.0',
      endpoints: {
        candidates: '/api/candidates',
        teams: '/api/teams',
      },
    };
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
