import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { Injectable } from '@nestjs/common';
import { InitializeConfirmRegistrationCommand } from './initialize-confirm-registration.usecase';

export class ResendConfirmationEmailCommand {
  constructor(public email: string) {}
}

@Injectable()
@CommandHandler(ResendConfirmationEmailCommand)
export class ResendConfirmationEmailUseCase
  implements ICommandHandler<ResendConfirmationEmailCommand, void>
{
  constructor(
    private usersRepository: UsersRepository,
    private commandBus: CommandBus,
  ) {}

  async execute({ email }: ResendConfirmationEmailCommand): Promise<void> {
    const user = await this.usersRepository.findByEmailOrNotFoundFail(email);

    await this.commandBus.execute(
      new InitializeConfirmRegistrationCommand(user.id),
    );
  }
}
