import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { EmailConfirmation } from '../../domain/entities/email-confirmation.entity';
import { EmailConfirmationRepository } from '../../infrastructure/email-confirmation.repository';

export class ConfirmRegistrationByCodeCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmRegistrationByCodeCommand)
export class ConfirmRegistrationByCodeUseCase
  implements ICommandHandler<ConfirmRegistrationByCodeCommand, void>
{
  constructor(
    private emailConfirmationRepository: EmailConfirmationRepository,
  ) {}

  async execute({ code }: ConfirmRegistrationByCodeCommand): Promise<void> {
    const userEmailConfirmation =
      await this.emailConfirmationRepository.findByConfirmationCodeOrNotFoundFail(
        code,
      );
    const isConfirmationCodeLegit = this.isEmailConfirmationValid(
      userEmailConfirmation,
      code,
    );

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

    const confirmedEmailConfirmation = this.confirmRegistration(
      userEmailConfirmation,
    );

    await this.emailConfirmationRepository.save(confirmedEmailConfirmation);
  }

  private isEmailConfirmationValid(
    emailConfirmation: EmailConfirmation,
    code: string,
  ): boolean {
    if (
      !emailConfirmation.confirmationCode ||
      !emailConfirmation.confirmationExpiresAt ||
      emailConfirmation.isConfirmed
    ) {
      return false;
    }
    return (
      emailConfirmation.confirmationCode === code &&
      emailConfirmation.confirmationExpiresAt > new Date()
    );
  }

  private confirmRegistration(
    emailConfirmation: EmailConfirmation,
  ): EmailConfirmation {
    return {
      ...emailConfirmation,
      confirmationExpiresAt: null,
      confirmationCode: null,
      isConfirmed: true,
    };
  }
}
