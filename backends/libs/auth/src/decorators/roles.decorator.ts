import { SetMetadata } from '@nestjs/common';

/**
 * Defines required roles.
 * @param roles Required roles.
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
