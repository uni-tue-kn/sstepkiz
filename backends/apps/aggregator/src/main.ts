import { LoggerService } from '@libs/logger';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { AppConfigService } from './app-config/services/app-config/app-config.service';
import { AppService } from './services/app/app.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Enable input validation.
  app.useGlobalPipes(new ValidationPipe());

  // Get the configuration service.
  const configService = app.get(AppConfigService);

  // Set the logger.
  const logger = app.get(LoggerService);
  logger.logLevel = configService.logLevel;
  app.useLogger(logger);

  try {
    // Start listening on configured port.
    await app.listen(configService.port);

    // Start main service.
    const appService = app.get(AppService);
    await appService.main();    
  } catch (error) {
    logger.error(`Aggregator crashed: ${error}`);
    await app.close();
    process.exit(-1);
  }
}
bootstrap();
