import { DynamicModule, Type, ForwardReference } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

export interface DbAsyncModuleOptions {
  entityTypes: EntityClassOrSchema[];
  global?: boolean;
  imports?: (
    | DynamicModule
    | Type<any>
    | Promise<DynamicModule>
    | ForwardReference<any>
  )[];
  inject?: any[];
  useFactory?: (
    ...args: any[]
  ) => Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions;
}
