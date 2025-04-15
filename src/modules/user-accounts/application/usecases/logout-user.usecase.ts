import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRefreshContextDto } from '../../guards/dto/user-context.dto';
import { ExternalAuthMetaRepository } from '../../../security-devices/infrastructure/external/external.auth-meta.repository';

export class LogoutUserCommand {
  constructor(public refreshTokenPayload: UserRefreshContextDto) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUsecase
  implements ICommandHandler<LogoutUserCommand, void>
{
  constructor(private authMetaRepository: ExternalAuthMetaRepository) {}

  async execute({ refreshTokenPayload }: LogoutUserCommand): Promise<void> {
    const { id: userId, deviceId, iat } = refreshTokenPayload;

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
