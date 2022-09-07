import {
  JwtBearerAuthGuard,
  Roles,
  Scopes,
  RoleGuard,
  ScopeGuard,
} from '@libs/auth';
import { LoggerService } from '@libs/logger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PermissionDescription } from '@sstepkiz';

import { PermissionDescriptionDto } from '../../dtos/permission-description.dto';
import { PermissionService } from '../../services/permission/permission.service';

@Controller('permissions')
export class PermissionsController {
  /**
   * Constructs a new permission controller.
   * @param logger Instance of logger service.
   * @param permissionService Instance of socket service.
   */
  constructor(
    private readonly logger: LoggerService,
    private readonly permissionService: PermissionService,
  ) {}

  /**
   * Creates new permissions.
   * @param description Description of permissions to create.
   * @param req Full request.
   * @returns New created permissions.
   */
  @Post()
  @Roles('ADMIN')
  @Scopes('signalling_admin')
  @UseGuards(JwtBearerAuthGuard, RoleGuard, ScopeGuard)
  async create(
    @Body() description: PermissionDescriptionDto,
    @Request() req: any,
  ): Promise<PermissionDescription> {
    this.logger.log(
      `User "${req.user.username}" creates new permissions: ${JSON.stringify(
        description,
      )}`,
      this.constructor.name,
    );
    const permissions = await this.permissionService.createPermissions(
      description,
    );
    return permissions.getDescription();
  }

  /**
   * Finds all permissions.
   * @param req Full request.
   * @returns Found permissions.
   */
  @Get()
  @Roles('ADMIN')
  @Scopes('signalling_admin')
  @UseGuards(JwtBearerAuthGuard, RoleGuard, ScopeGuard)
  async findAll(@Request() req: any): Promise<PermissionDescription[]> {
    this.logger.log(
      `User "${req.user.username}" requests all permissions`,
      this.constructor.name,
    );
    return await this.permissionService.getPermissions('subject', 'target');
  }

  /**
   * Removes existing permissions.
   * @param description Description of permissions to remove.
   * @param req Full request.
   */
  @Delete(':subjectId/:targetId')
  @Roles('ADMIN')
  @Scopes('signalling_admin')
  @UseGuards(JwtBearerAuthGuard, RoleGuard, ScopeGuard)
  // TODO: Validate subjectId and targetId.
  async remove(
    @Param('subjectId') subjectId: string,
    @Param('targetId') targetId: string,
    @Request() req: any,
  ): Promise<void> {
    this.logger.log(
      `User "${req.user.username}" deletes permissions: ${JSON.stringify({
        subjectId,
        targetId,
      })}`,
      this.constructor.name,
    );
    await this.permissionService.removePermissions({ subjectId, targetId });
  }

  /**
   * Updates existing permissions.
   * @param description Description of permissions to update.
   * @param req Full request.
   * @returns Updated permissions.
   */
  @Put()
  @Roles('ADMIN')
  @Scopes('signalling_admin')
  @UseGuards(JwtBearerAuthGuard, RoleGuard, ScopeGuard)
  async update(
    @Body() description: PermissionDescriptionDto,
    @Request() req: any,
  ): Promise<void> {
    this.logger.log(
      `User "${req.user.username}" updates permissions: ${JSON.stringify(
        description,
      )}`,
      this.constructor.name,
    );
    await this.permissionService.updatePermissions(description);
  }
}
