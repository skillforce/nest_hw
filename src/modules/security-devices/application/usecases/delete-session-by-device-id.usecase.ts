import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthMetaRepository } from '../../infrastructure/auth-meta.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { AuthMeta } from '../../domain/auth-meta.entity';

export class DeleteSessionByDeviceIdCommand {
  constructor(
    public userId: number,
    public deviceId: string,
  ) {}
}

@CommandHandler(DeleteSessionByDeviceIdCommand)
export class DeleteSessionByDeviceIdUseCase
  implements ICommandHandler<DeleteSessionByDeviceIdCommand, void>
{
  constructor(private authMetaRepository: AuthMetaRepository) {}

  async execute({
    userId,
    deviceId,
  }: DeleteSessionByDeviceIdCommand): Promise<void> {
    const sessions =
      await this.authMetaRepository.findManyByDeviceIdOrNotFoundFail(deviceId);

    const sessionToDelete = sessions.find(
      (session) => session.userId === userId,
    );
    if (!sessionToDelete) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'user is not owner of the session',
      });
    }

    const deletedSession = this.makeDeleted(sessionToDelete);
    await this.authMetaRepository.save(deletedSession);
  }

  private makeDeleted(session: AuthMeta) {
    return {
      ...session,
      deletedAt: new Date(),
    };
  }
}
