import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../infrastructure/users.repository';

export class ConfirmRegistrationByCodeCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmRegistrationByCodeCommand)
export class ConfirmRegistrationByCodeUseCase
  implements ICommandHandler<ConfirmRegistrationByCodeCommand, void>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute({ code }: ConfirmRegistrationByCodeCommand): Promise<void> {
    const user =
      await this.usersRepository.findByConfirmationCodeOrNotFoundFail(code);
    const isConfirmationCodeLegit = user.isEmailConfirmationValid(code);

    if (!isConfirmationCodeLegit) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            field: 'code',
            message: 'code is not valid',
          },
        ],
        message: 'code is not valid',
      });
    }

    user.confirmRegistration();
    await this.usersRepository.save(user);
  }
}
