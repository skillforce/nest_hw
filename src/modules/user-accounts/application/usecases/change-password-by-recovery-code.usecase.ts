import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../infrastructure/users.repository';
import { BcryptService } from '../bcrypt-service';
import { PasswordRecoveryConfirmation } from '../../domain/entities/password-recovery-confirmation.entity';
import { PasswordRecoveryConfirmationRepository } from '../../infrastructure/password-recovery-confirmation.repository';

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
    private passwordRecoveryConfirmationRepository: PasswordRecoveryConfirmationRepository,
    private bcryptService: BcryptService,
  ) {}

  async execute({
    newPassword,
    recoveryCode,
  }: ChangePasswordByRecoveryCodeCommand): Promise<void> {
    const passwordRecoveryConfirmation =
      await this.passwordRecoveryConfirmationRepository.findByRecoveryCodeOrNotFoundFail(
        recoveryCode,
      );

    const isConfirmationCodeLegit = this.isPasswordRecoveryConfirmationValid(
      passwordRecoveryConfirmation,
    );

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

    const user = await this.usersRepository.findByIdOrNotFoundFail(
      passwordRecoveryConfirmation.userId,
    );

    const newPasswordHash = await this.bcryptService.hashPassword(newPassword);
    const confirmedPasswordRecovery = this.createConfirmedPasswordRecovery(
      passwordRecoveryConfirmation.userId,
      passwordRecoveryConfirmation.id,
    );

    await this.passwordRecoveryConfirmationRepository.save(
      confirmedPasswordRecovery,
    );
    await this.usersRepository.save({ ...user, passwordHash: newPasswordHash });
  }

  private isPasswordRecoveryConfirmationValid(
    passwordRecoveryConfirmation: PasswordRecoveryConfirmation,
  ): boolean {
    if (!passwordRecoveryConfirmation?.confirmationExpiresAt) {
      return false;
    }

    return passwordRecoveryConfirmation.confirmationExpiresAt > new Date();
  }
  private createConfirmedPasswordRecovery(
    userId: number,
    confirmationId: number,
  ): Omit<PasswordRecoveryConfirmation, 'id'> & { id?: number } {
    return {
      id: confirmationId,
      confirmationCode: null,
      confirmationExpiresAt: null,
      userId,
      isConfirmed: true,
    };
  }
}
