import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
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

    if (
      user.emailConfirmation.isConfirmed ||
      !user.emailConfirmation.confirmationCode
    ) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            field: 'email',
            message: 'user is already confirmed',
          },
        ],
        message: 'user is already confirmed',
      });
    }
    await this.commandBus.execute(
      new InitializeConfirmRegistrationCommand(user._id.toString()),
    );
  }
}
