import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from '../application/users-service';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { UserViewDto } from './view-dto/users.view-dto';
import { CreateUserInputDto } from './input-dto/user.input-dto';
import { ApiParam } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userQueryRepository: UsersQueryRepository,
  ) {
    console.log('UsersController created!');
  }
  @Get('/')
  async getAllUsers(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.userQueryRepository.getAllUsers(query);
  }
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() dto: CreateUserInputDto) {
    const newUserId = await this.usersService.createUser(dto);
    return this.userQueryRepository.getByIdOrNotFoundFail(newUserId);
  }

  @ApiParam({ name: 'id' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserById(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
