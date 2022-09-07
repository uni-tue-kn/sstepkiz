import { AuthOptions } from './auth-options.class';

export interface AuthModuleOptionsFactory {
  createAuthModuleOptions(): Promise<AuthOptions> | AuthOptions;
}
