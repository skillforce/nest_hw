import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../infrastructure/users.repository';
import { BcryptService } from '../bcrypt-service';

export class ChangePasswordByRecoveryCodeCommand {
  constructor(
    public newPassword: string,
    public recoveryCode: string,
  ) {}
}

@CommandHandler(ChangePasswordByRecoveryCodeCommand)
export class ChangePasswordByRecoveryCodeUseCase
  implements ICommandHandler<ChangePasswordByRecoveryCodeCommand, void>
{
  constructor(
    private usersRepository: UsersRepository,
    private bcryptService: BcryptService,
  ) {}

  async execute({
    newPassword,
    recoveryCode,
  }: ChangePasswordByRecoveryCodeCommand): Promise<void> {
    const user =
      await this.usersRepository.findByPasswordRecoveryCodeOrNotFoundFail(
        recoveryCode,
      );

    const isConfirmationCodeLegit = user.isPasswordRecoveryConfirmationValid();

    if (!isConfirmationCodeLegit) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            field: 'recoveryCode',
            message: 'recoveryCode is not valid',
          },
        ],
        message: 'recoveryCode is not valid',
      });
    }
    const newPasswordHash = await this.bcryptService.hashPassword(newPassword);
    user.confirmPasswordRecovery(newPasswordHash);
    await this.usersRepository.save(user);
  }
}
