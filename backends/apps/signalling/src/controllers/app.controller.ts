import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  /**
   * Generates a hello message.
   * @returns Hello Message.
   */
  @Get()
  getHello(): string {
    return 'Welcome to the SSteP-KiZ Signalling Server!';
  }
}
