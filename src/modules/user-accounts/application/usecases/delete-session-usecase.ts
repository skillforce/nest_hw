import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from '../../constants/auth-tokens.inject-contants';
import { JwtService } from '@nestjs/jwt';
import { AuthMetaRepository } from '../../infrastructure/auth-meta.repository';

export class DeleteSessionCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionUseCase
  implements ICommandHandler<DeleteSessionCommand, void>
{
  constructor(
    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,

    private authMetaRepository: AuthMetaRepository,
  ) {}

  async execute({ refreshToken }: DeleteSessionCommand): Promise<void> {
    const {
      id: userId,
      deviceId,
      iat,
    }: {
      id: string;
      deviceId: string;
      iat: number;
    } = this.refreshTokenContext.decode(refreshToken);

    const session =
      await this.authMetaRepository.findByDeviceIdAndUserIdAndIatOrNotFoundFail(
        deviceId,
        userId,
        this.transformTimestampsToIsoString(iat),
      );

    session.makeDeleted();

    await this.authMetaRepository.save(session);
  }
  transformTimestampsToIsoString(timestamp: number) {
    return new Date(timestamp * 1000).toISOString();
  }
}
