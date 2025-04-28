import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { Injectable } from '@nestjs/common';
import { InitializeConfirmRegistrationCommand } from './initialize-confirm-registration.usecase';
import { EmailConfirmationRepository } from '../../infrastructure/email-confirmation.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

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
    private emailConfirmationRepository: EmailConfirmationRepository,
    private commandBus: CommandBus,
  ) {}

  async execute({ email }: ResendConfirmationEmailCommand): Promise<void> {
    const user = await this.usersRepository.findByEmailOrNotFoundFail(email);
    await this.checkIsConfirmed(user.id);
    await this.commandBus.execute(
      new InitializeConfirmRegistrationCommand(user.id),
    );
  }
  private async checkIsConfirmed(userId: string): Promise<void> {
    const confirmationEntity =
      await this.emailConfirmationRepository.findByUserIdOrNotFoundFail(userId);

    if (confirmationEntity.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'email is confirmed',
        extensions: [
          {
            field: 'email',
            message: 'email is confirmed',
          },
        ],
      });
    }
  }
}
