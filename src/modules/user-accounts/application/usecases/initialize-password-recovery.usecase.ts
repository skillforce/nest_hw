import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { randomUUID } from 'node:crypto';
import { PasswordRecoveryInitializedEvent } from '../../domain/events/password-recovery-initialized.event';

export class InitializePasswordRecoveryCommand {
  constructor(public email: string) {}
}

@CommandHandler(InitializePasswordRecoveryCommand)
export class InitializePasswordRecoveryUseCase
  implements ICommandHandler<InitializePasswordRecoveryCommand, void>
{
  constructor(
    private usersRepository: UsersRepository,
    private eventBus: EventBus,
  ) {}

  async execute({ email }: InitializePasswordRecoveryCommand): Promise<void> {
    const user = await this.usersRepository.findByEmailOrNotFoundFail(email);
    const confirmationCode = randomUUID();

    user.setPasswordRecoveryConfirmationCode(confirmationCode);
    await this.usersRepository.save(user);
    this.eventBus.publish(
      new PasswordRecoveryInitializedEvent(user.email, confirmationCode),
    );
  }
}
