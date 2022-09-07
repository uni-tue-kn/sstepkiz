import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { AppConfigService } from './app-config/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Disable x-powered-by header for security reasons.
  app.disable('x-powered-by');

  // Enable Form Validation.
  app.useGlobalPipes(new ValidationPipe());

  // Enable CORS for development mode.
  if (process.env.NODE_ENV === 'dev') {
    app.enableCors();
  }

  // Get configuration service.
  const configService = app.get(AppConfigService);

  // Start listening on configured port.
  await app.listen(configService.port);
}
bootstrap();
