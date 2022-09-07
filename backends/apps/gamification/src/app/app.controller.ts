import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  /**
   * Generates a hello message.
   * @returns The hello message.
   */
  @Get()
  hello(): string {
    return 'Welcome to SSteP-KiZ Gamification Server!';
  }
}
