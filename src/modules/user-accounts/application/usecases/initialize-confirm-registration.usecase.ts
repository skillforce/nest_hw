import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { EmailConfirmationRepository } from '../../infrastructure/email-confirmation.repository';
import { EmailConfirmation } from '../../domain/entities/email-confirmation.entity';

export class InitializeConfirmRegistrationCommand {
  constructor(
    public userId: number,
    public previousConfirmationEntityId?: number,
  ) {}
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
    previousConfirmationEntityId,
  }: InitializeConfirmRegistrationCommand): Promise<void> {
    const user = await this.usersRepository.findByIdOrNotFoundFail(userId);
    const confirmationCode = randomUUID();
    const newEmailConfirmation = this.createEmailConfirmationEntity(
      confirmationCode,
      user.id,
      previousConfirmationEntityId,
    );
    await this.emailConfirmationRepository.save(newEmailConfirmation);
    this.eventBus.publish(
      new UserRegisteredEvent(user.email, confirmationCode),
    );
  }
  private createEmailConfirmationEntity(
    confirmationCode: string,
    userId: number,
    previousConfirmationEntityId: number | undefined,
    expiresInMinutes = 30,
  ): Omit<EmailConfirmation, 'id'> & { id?: number } {
    return {
      confirmationCode,
      confirmationExpiresAt: new Date(
        Date.now() + expiresInMinutes * 60 * 1000,
      ),
      userId,
      ...(previousConfirmationEntityId && { id: previousConfirmationEntityId }),
      isConfirmed: false,
    };
  }
}
