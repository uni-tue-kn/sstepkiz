import {
  JwtBearerAuthGuard,
  Roles,
  ScopeGuard,
  Scopes,
  RoleGuard,
} from '@libs/auth';
import { LoggerService } from '@libs/logger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserDescription } from '../../../../../../../shared/dist';

import { UserDescriptionDto } from '../../dtos/user-description.dto';
import { UserService } from '../../services/user/user.service';

@Controller('users')
export class UsersController {
  /**
   * Constructs a new user controller.
   * @param logger Instance of logger service.
   * @param userService Instance of socket service.
   */
  constructor(
    private readonly logger: LoggerService,
    private readonly userService: UserService,
  ) {}

  /**
   * Creates a new user from description.
   * @param description Description of user.
   * @param req Full request.
   * @returns Description of newly created user.
   */
  @Post()
  @Roles('ADMIN')
  @Scopes('signalling_admin')
  @UseGuards(JwtBearerAuthGuard, RoleGuard, ScopeGuard)
  async create(
    @Body() description: UserDescriptionDto,
    @Request() req: any,
  ): Promise<UserDescription> {
    this.logger.log(
      `User "${req.user.username}" creates user: ${JSON.stringify(
        description,
      )}`,
      this.constructor.name,
    );
    const user = await this.userService.createUser(description);
    return user.getDescription();
  }

  /**
   * Finds all users.
   * @param req Full request.
   * @returns Description of all users.
   */
  @Get()
  @Roles('ADMIN')
  @Scopes('signalling_admin')
  // @Scopes('signalling_patient')
  @UseGuards(JwtBearerAuthGuard, RoleGuard, ScopeGuard)
  async findAll(@Request() req: any): Promise<UserDescription[]> {
    this.logger.log(
      `User "${req.user.username}" requests all users`,
      this.constructor.name,
    );
    return await this.userService.getUsers();
  }

  /**
   * Removes existing user.
   * @param description Description of user.
   * @param req Full request.
   */
  @Delete(':userId')
  @Roles('ADMIN')
  @Scopes('signalling_admin')
  @UseGuards(JwtBearerAuthGuard, RoleGuard, ScopeGuard)
  async remove(
    @Param() description: UserDescriptionDto,
    @Request() req: any,
  ): Promise<void> {
    this.logger.log(
      `User "${req.user.username}" removes user "${description.userId}"`,
      this.constructor.name,
    );
    await this.userService.deleteUser(description.userId);
  }
}
