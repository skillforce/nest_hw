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
import { AuthMeta } from '../../../security-devices/domain/auth-meta.entity';
import { ExternalAuthMetaRepository } from '../../../security-devices/infrastructure/external/external.auth-meta.repository';
import { CreateAuthMetaDomainDto } from '../../../security-devices/domain/dto/create-auth-meta.domain.dto';

export class GenerateNewTokensCommand {
  constructor(
    public userId: number,
    public userAgent: string,
    public ipAddress: string,
  ) {}
}

@CommandHandler(GenerateNewTokensCommand)
export class GenerateNewTokensUsecase
  implements
    ICommandHandler<
      GenerateNewTokensCommand,
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

  async execute({
    userId,
    ipAddress,
    userAgent,
  }: GenerateNewTokensCommand): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { accessToken, refreshToken } = this.generateTokensPair(userId);

    await this.createSession(refreshToken, ipAddress, userAgent);

    return { accessToken, refreshToken };
  }

  generateTokensPair(userId: number): {
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
      id: number;
      deviceId: string;
    } = await this.refreshTokenContext.decode(refreshToken);
    const iatIso = this.transformTimestampsToIsoString(decodedRefreshToken.iat);
    const expIso = this.transformTimestampsToIsoString(decodedRefreshToken.exp);
    const authMetaSession: AuthMetaDto = {
      iat: iatIso,
      userId: decodedRefreshToken.id,
      deviceId: decodedRefreshToken.deviceId,
      exp: expIso,
      deviceName: userAgent,
      ipAddress: ipAddress,
    };

    const newSession = this.createInstance(authMetaSession);
    console.log(newSession);
    await this.authMetaRepository.save(newSession);
  }
  transformTimestampsToIsoString(timestamp: number) {
    return new Date(timestamp * 1000).toISOString();
  }

  private createInstance(authMetaDto: CreateAuthMetaDomainDto): AuthMeta {
    const authMetaSession = new AuthMeta();

    authMetaSession.iat = authMetaDto.iat;
    authMetaSession.userId = authMetaDto.userId;
    authMetaSession.deviceId = authMetaDto.deviceId;
    authMetaSession.exp = authMetaDto.exp;
    authMetaSession.deviceName = authMetaDto.deviceName;
    authMetaSession.ipAddress = authMetaDto.ipAddress;
    authMetaSession.deletedAt = null;

    return authMetaSession;
  }
}
