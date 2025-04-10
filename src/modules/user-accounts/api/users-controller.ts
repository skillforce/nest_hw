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
  UseGuards,
} from '@nestjs/common';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { GetUsersQueryParams } from './input-dto/users-input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { UserViewDto } from './view-dto/users-view-dto/users.view-dto';
import { CreateUserInputDto } from './input-dto/users-input-dto/user.input-dto';
import { ApiParam } from '@nestjs/swagger';
import { BasicAuthGuard } from '../guards/basic/basic-auth.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteUserByIdCommand } from '../application/usecases/delete-user-by-id.usecase';
import { CreateUserCommand } from '../application/usecases/create-user.usecase';
import { IsMongoId } from 'class-validator';
import { IdParamDto } from '../../../core/decorators/validation/objectIdDto';

@SkipThrottle()
@Controller('users')
@UseGuards(BasicAuthGuard)
export class UsersController {
  constructor(
    private readonly userQueryRepository: UsersQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('/')
  async getAllUsers(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.userQueryRepository.getAllUsers(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() dto: CreateUserInputDto) {
    const createdUserId = await this.commandBus.execute<
      CreateUserCommand,
      string
    >(new CreateUserCommand(dto, true));

    return this.userQueryRepository.getByIdOrNotFoundFail(createdUserId);
  }

  @ApiParam({ name: 'id' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserById(@Param() { id }: IdParamDto) {
    return this.commandBus.execute<DeleteUserByIdCommand, void>(
      new DeleteUserByIdCommand(id),
    );
  }
}
