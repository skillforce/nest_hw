import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  UserContextDto,
  UserRefreshContextDto,
} from '../../guards/dto/user-context.dto';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-contants';
import { JwtService } from '@nestjs/jwt';
import { AuthMeta } from '../../../security-devices/domain/auth-meta.entity';
import { ExternalAuthMetaRepository } from '../../../security-devices/infrastructure/external/external.auth-meta.repository';

export class UpdateRefreshTokenCommand {
  constructor(public refreshTokenPayload: UserRefreshContextDto) {}
}

@CommandHandler(UpdateRefreshTokenCommand)
export class UpdateRefreshTokenUsecase
  implements
    ICommandHandler<
      UpdateRefreshTokenCommand,
      { accessToken: string; refreshToken: string }
    >
{
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,

    private authMetaRepository: ExternalAuthMetaRepository,
  ) {}

  async execute({ refreshTokenPayload }: UpdateRefreshTokenCommand): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { id: userId, deviceId, iat } = refreshTokenPayload;

    const session =
      await this.authMetaRepository.findByDeviceIdAndUserIdAndIatOrNotFoundFail(
        deviceId,
        userId,
        this.transformTimestampsToIsoString(iat),
      );
    const newTokensPair = this.generateNewTokensPair(userId, deviceId);

    const decodedNewRefreshToken: { iat: number; exp: number } =
      this.refreshTokenContext.decode(newTokensPair.refreshToken);

    const newIat = this.transformTimestampsToIsoString(
      decodedNewRefreshToken.iat,
    );
    const newExp = this.transformTimestampsToIsoString(
      decodedNewRefreshToken.exp,
    );

    await this.updateSession(session, newIat, newExp);

    return {
      accessToken: newTokensPair.accessToken,
      refreshToken: newTokensPair.refreshToken,
    };
  }

  generateNewTokensPair(
    userId: string,
    deviceId: string,
  ): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = this.accessTokenContext.sign({
      id: userId,
    } as UserContextDto);

    const refreshToken = this.refreshTokenContext.sign({
      id: userId,
      deviceId,
    });

    return { accessToken, refreshToken };
  }

  async updateSession(session: AuthMeta, newIat: string, newExp: string) {
    const updatedSession: AuthMeta = {
      ...session,
      iat: newIat,
      exp: newExp,
    };

    await this.authMetaRepository.save(updatedSession);
  }
  transformTimestampsToIsoString(timestamp: number) {
    return new Date(timestamp * 1000).toISOString();
  }
}
