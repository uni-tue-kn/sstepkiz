import { SetMetadata } from '@nestjs/common';

/**
 * Defines required scopes.
 * @param scopes Required scopes.
 */
export const Scopes = (...scopes: string[]) => SetMetadata('scopes', scopes);
