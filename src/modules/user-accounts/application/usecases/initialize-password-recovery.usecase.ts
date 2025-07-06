import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { randomUUID } from 'node:crypto';
import { PasswordRecoveryInitializedEvent } from '../../domain/events/password-recovery-initialized.event';
import { PasswordRecoveryConfirmation } from '../../domain/entities/password-recovery-confirmation.entity';
import { PasswordRecoveryConfirmationRepository } from '../../infrastructure/password-recovery-confirmation.repository';

export class InitializePasswordRecoveryCommand {
  constructor(public email: string) {}
}

@CommandHandler(InitializePasswordRecoveryCommand)
export class InitializePasswordRecoveryUseCase
  implements ICommandHandler<InitializePasswordRecoveryCommand, void>
{
  constructor(
    private usersRepository: UsersRepository,
    private passwordRecoveryConfirmationRepository: PasswordRecoveryConfirmationRepository,
    private eventBus: EventBus,
  ) {}

  async execute({ email }: InitializePasswordRecoveryCommand): Promise<void> {
    const user = await this.usersRepository.findByEmailOrNotFoundFail(email);
    const confirmationCode = randomUUID();

    const passwordRecoveryConfirmation =
      this.createPasswordRecoveryConfirmationCode(confirmationCode, user.id);
    console.log(passwordRecoveryConfirmation);

    await this.passwordRecoveryConfirmationRepository.save(
      passwordRecoveryConfirmation,
    );

    this.eventBus.publish(
      new PasswordRecoveryInitializedEvent(user.email, confirmationCode),
    );
  }
  private createPasswordRecoveryConfirmationCode(
    code: string,
    userId: number,
    expiresInMinutes = 30,
  ): Omit<PasswordRecoveryConfirmation, 'id'> {
    return {
      confirmationCode: code,
      confirmationExpiresAt: new Date(
        Date.now() + expiresInMinutes * 60 * 1000,
      ),
      isConfirmed: false,
      userId,
    };
  }
}
