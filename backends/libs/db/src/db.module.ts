import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DbAsyncModuleOptions } from './types/db-async-module-options.interface';

@Module({})
export class DbModule {
  static forRootAsync(options: DbAsyncModuleOptions): DynamicModule {
    return {
      global: options.global,
      imports: [
        TypeOrmModule.forFeature(options.entityTypes),
        TypeOrmModule.forRootAsync({
          imports: options.imports,
          inject: options.inject,
          useFactory: options.useFactory,
        }),
      ],
      exports: [TypeOrmModule],
      module: DbModule,
    };
  }
}
