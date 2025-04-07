import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';

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
    private eventBus: EventBus,
  ) {}

  async execute({
    userId,
  }: InitializeConfirmRegistrationCommand): Promise<void> {
    const user = await this.usersRepository.findOrNotFoundFail(userId);
    const confirmationCode = randomUUID();
    user.setEmailConfirmationCode(confirmationCode);
    await this.usersRepository.save(user);
    this.eventBus.publish(
      new UserRegisteredEvent(user.email, confirmationCode),
    );
  }
}
