import {
  Roles,
  Scopes,
  JwtBearerAuthGuard,
  RoleGuard,
  ScopeGuard,
} from '@libs/auth';
import { UserGameSheet } from '@sstepkiz';
import { UserGameSheetUpdateDataDto } from '../dtos/user-game-sheet-update-data.dto';
import {
  Body,
  ConflictException,
  Controller,
  Get,
  Request,
  Param,
  Post,
  Put,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { NewUserDto } from '../dtos/new-user.dto';

import { GameLogicService } from '../services/game-logic.service';
import { UserGameSheetDto } from '../dtos/user-game-sheet.dto';

@Controller('game-logic')
export class GameLogicController {
  constructor(private readonly gameService: GameLogicService) {}

  @Get('test')
  @Roles('USER')
  @Scopes('game')
  @UseGuards(JwtBearerAuthGuard, RoleGuard, ScopeGuard)
  test(@Request() request: any) {
    return JSON.stringify(request.user.username);
  }

  @Post()
  @Roles('ADMIN')
  @Scopes('game_admin')
  @UseGuards(JwtBearerAuthGuard, RoleGuard, ScopeGuard)
  async create(@Body() user: NewUserDto) {
    // Ensure that userGameSheet does not exist.
    if (await this.gameService.existsConfiguration(user.id)) {
      throw new ConflictException(
        undefined,
        'A sheet for the target user already exists',
      );
    }
    // Store configuration to database.
    return await this.gameService.createFirstSheet(user.id);
  }

  @Get()
  @Roles('USER')
  @Scopes('game')
  @UseGuards(JwtBearerAuthGuard, RoleGuard, ScopeGuard)
  async find(@Request() request: any): Promise<UserGameSheet> {
    const result = await this.gameService.findUserSheet(request.user.username);
    return result;
  }

  @Roles('ADMIN')
  @Scopes('game_admin')
  @UseGuards(JwtBearerAuthGuard, RoleGuard, ScopeGuard)
  @Get('/')
  async findAll() {
    return await this.gameService.findAllUsers();
  }

  @Delete(':id')
  @Roles('ADMIN')
  @Scopes('game_admin')
  @UseGuards(JwtBearerAuthGuard, RoleGuard, ScopeGuard)
  async delete(@Param('id') targetUser: string) {
    return await this.gameService.removeUserGameSheet(targetUser);
  }

  /**
   * @param targetUser
   * @param toUpdateValue {key: value, ....} key name in database
   */
  @Put('update-all')
  @Roles('USER')
  @Scopes('game')
  @UseGuards(JwtBearerAuthGuard, RoleGuard, ScopeGuard)
  async updateGameSheetAllData(
    @Request() request: any,
    @Body() toUpdateValue: UserGameSheetDto,
  ) {
    return this.gameService.updateGameSheetAllData(
      request.user.username,
      toUpdateValue,
    );
  }

  /**
   * Only updates the values in User_Game_Sheet not the dependencies.
   * Use for update: Name, currentTitle, highestMap, coins
   * @param targetUser
   * @param toUpdateValue
   */
  @Put('update-core-data')
  @Roles('USER')
  @Scopes('game')
  @UseGuards(JwtBearerAuthGuard, RoleGuard, ScopeGuard)
  async updateGameSheetCoreData(
    @Request() request: any,
    @Body() toUpdateValue: UserGameSheetUpdateDataDto,
  ) {
    return this.gameService.updateGameSheetCoreData(
      request.user.username,
      toUpdateValue,
    );
  }
}
