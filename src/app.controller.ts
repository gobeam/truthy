import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/health')
  getHello() {
    return {
      status: 200
    };
  }
}
