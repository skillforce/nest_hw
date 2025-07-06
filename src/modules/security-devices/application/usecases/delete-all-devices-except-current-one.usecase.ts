import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthMetaRepository } from '../../infrastructure/auth-meta.repository';

export class DeleteAllUserDevicesExceptCurrentOneCommand {
  constructor(
    public userId: number,
    public deviceId: string,
  ) {}
}

@CommandHandler(DeleteAllUserDevicesExceptCurrentOneCommand)
export class DeleteAllUserDevicesExceptCurrentOneUseCase
  implements ICommandHandler<DeleteAllUserDevicesExceptCurrentOneCommand, void>
{
  constructor(private authMetaRepository: AuthMetaRepository) {}

  async execute({
    userId,
    deviceId,
  }: DeleteAllUserDevicesExceptCurrentOneCommand): Promise<void> {
    await this.authMetaRepository.markAllSessionsAsDeletedExceptWithDeviceId(
      userId,
      deviceId,
    );
  }
}
