import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/health')
  health() {
    return {
      status: 200
    };
  }

  @Get('')
  index() {
    return {
      message: 'hello world'
    };
  }
}
