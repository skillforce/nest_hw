import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ExtractRefreshTokenDataFromRequest } from '../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UserRefreshContextDto } from '../../user-accounts/guards/dto/user-context.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtRefreshGuard } from '../guards/refreshToken/refresh-token.guard';
import { DevicesViewDto } from './view-dto/devices.view-dto';
import { AuthMetaQueryRepository } from '../infrastructure/query/auth-meta.query-repository';
import { ApiParam } from '@nestjs/swagger';
import {
  IdMongoParamDto,
  IdStringParamDto,
  IdUuidParamDto,
} from '../../../core/decorators/validation/objectIdDto';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteSessionByDeviceIdCommand } from '../application/usecases/delete-session-by-device-id.usecase';
import { DeleteAllUserDevicesExceptCurrentOneCommand } from '../application/usecases/delete-all-devices-except-current-one.usecase';

@SkipThrottle()
@Controller('security')
export class SecurityController {
  constructor(
    private authMetaQueryRepository: AuthMetaQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get('/devices')
  @UseGuards(JwtRefreshGuard)
  async getCommentById(
    @ExtractRefreshTokenDataFromRequest()
    refreshTokenPayload: UserRefreshContextDto,
  ): Promise<DevicesViewDto[]> {
    return this.authMetaQueryRepository.getDevicesForUser(
      refreshTokenPayload.id,
    );
  }

  @Delete('/devices')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllSessions(
    @ExtractRefreshTokenDataFromRequest()
    refreshTokenPayload: UserRefreshContextDto,
  ) {
    return this.commandBus.execute<
      DeleteAllUserDevicesExceptCurrentOneCommand,
      void
    >(
      new DeleteAllUserDevicesExceptCurrentOneCommand(
        refreshTokenPayload.id,
        refreshTokenPayload.deviceId,
      ),
    );
  }

  @ApiParam({ name: 'id' })
  @Delete('/devices/:id')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSessionById(
    @Param() { id }: IdStringParamDto,
    @ExtractRefreshTokenDataFromRequest()
    refreshTokenPayload: UserRefreshContextDto,
  ) {
    return this.commandBus.execute<DeleteSessionByDeviceIdCommand, void>(
      new DeleteSessionByDeviceIdCommand(refreshTokenPayload.id, id),
    );
  }
}
