import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { EmailConfirmationRepository } from '../../infrastructure/email-confirmation.repository';
import { EmailConfirmation } from '../../domain/schemas/email-confirmation.schema';

export class InitializeConfirmRegistrationCommand {
  constructor(public userId: string) {}
}

@Injectable()
@CommandHandler(InitializeConfirmRegistrationCommand)
export class InitializeConfirmRegistrationUseCase
  implements ICommandHandler<InitializeConfirmRegistrationCommand, void>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailConfirmationRepository: EmailConfirmationRepository,
    private eventBus: EventBus,
  ) {}

  async execute({
    userId,
  }: InitializeConfirmRegistrationCommand): Promise<void> {
    const user = await this.usersRepository.findByIdOrNotFoundFail(userId);
    const confirmationCode = randomUUID();
    const newEmailConfirmation = this.createEmailConfirmationEntity(
      confirmationCode,
      user.id,
    );
    await this.emailConfirmationRepository.save(newEmailConfirmation);
    this.eventBus.publish(
      new UserRegisteredEvent(user.email, confirmationCode),
    );
  }
  private createEmailConfirmationEntity(
    confirmationCode: string,
    userId: string,
    expiresInMinutes = 30,
  ): EmailConfirmation {
    return {
      confirmationCode,
      confirmationExpiresAt: new Date(
        Date.now() + expiresInMinutes * 60 * 1000,
      ),
      userId,
      isConfirmed: false,
    };
  }
}
