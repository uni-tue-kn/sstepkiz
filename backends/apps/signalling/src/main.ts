import { LoggerService } from '@libs/logger';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Disable x-powered-by header for security reasons.
  app.disable('x-powered-by');

  // Get the configuration service.
  const configService = app.get(AppConfigService);

  app.enableCors();

  // Set the logger.
  const logger = app.get(LoggerService);
  logger.logLevel = configService.logLevel;
  app.useLogger(logger);

  // Start listening on configured port.
  await app.listen(configService.port);
}
bootstrap();
