import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
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
import {
  GenerateNewSessionCommand,
  GenerateNewSessionUseCase,
} from './generate-new-session.usecase';

export class LoginUserCommand {
  constructor(
    public userId: string,
    public userAgent: string,
    public ipAddress: string,
  ) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase
  implements
    ICommandHandler<
      LoginUserCommand,
      { accessToken: string; refreshToken: string }
    >
{
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,

    private commandBus: CommandBus,
  ) {}

  async execute({
    userId,
    ipAddress,
    userAgent,
  }: LoginUserCommand): Promise<{ accessToken: string; refreshToken: string }> {
    const { refreshToken, accessToken } = await this.commandBus.execute<
      GenerateNewSessionCommand,
      { accessToken: string; refreshToken: string }
    >(new GenerateNewSessionCommand(userId, ipAddress, userAgent));

    return { accessToken, refreshToken };
  }
}
