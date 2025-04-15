import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserContextDto } from '../../guards/dto/user-context.dto';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-contants';
import { JwtService } from '@nestjs/jwt';
import { AuthMetaDto } from '../../dto/auth-meta.dto';
import { randomUUID } from 'node:crypto';
import { InjectModel } from '@nestjs/mongoose';
import { AuthMeta, AuthMetaModelType } from '../../domain/auth-meta.entity';
import { AuthMetaRepository } from '../../infrastructure/auth-meta.repository';

export class GenerateNewSessionCommand {
  constructor(
    public userId: string,
    public userAgent: string,
    public ipAddress: string,
  ) {}
}

@CommandHandler(GenerateNewSessionCommand)
export class GenerateNewSessionUseCase
  implements
    ICommandHandler<
      GenerateNewSessionCommand,
      { accessToken: string; refreshToken: string }
    >
{
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,

    @InjectModel(AuthMeta.name)
    private readonly AuthMetaModel: AuthMetaModelType,

    private authMetaRepository: AuthMetaRepository,
  ) {}

  async execute({
    userId,
    ipAddress,
    userAgent,
  }: GenerateNewSessionCommand): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { accessToken, refreshToken } = this.generateTokensPair(userId);

    await this.createSession(refreshToken, ipAddress, userAgent);

    return { accessToken, refreshToken };
  }

  generateTokensPair(userId: string): {
    accessToken: string;
    refreshToken: string;
  } {
    const newDeviceId = randomUUID();
    const accessToken = this.accessTokenContext.sign({
      id: userId,
    } as UserContextDto);

    const refreshToken = this.refreshTokenContext.sign({
      id: userId,
      deviceId: newDeviceId,
    });

    return { accessToken, refreshToken };
  }

  async createSession(
    refreshToken: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const decodedRefreshToken: {
      iat: number;
      exp: number;
      id: string;
      deviceId: string;
    } = await this.refreshTokenContext.decode(refreshToken);
    const iatIso = this.transformTimestampsToIsoString(decodedRefreshToken.iat);
    const expIso = this.transformTimestampsToIsoString(decodedRefreshToken.exp);
    const authMetaSession: AuthMetaDto = {
      iat: iatIso,
      user_id: decodedRefreshToken.id,
      device_id: decodedRefreshToken.deviceId,
      exp: expIso,
      device_name: userAgent,
      ip_address: ipAddress,
    };

    const newSession = this.AuthMetaModel.createInstance(authMetaSession);

    await this.authMetaRepository.save(newSession);
  }
  transformTimestampsToIsoString(timestamp: number) {
    return new Date(timestamp * 1000).toISOString();
  }
}
