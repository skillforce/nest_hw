import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordRecoveryConfirmation } from '../domain/entities/password-recovery-confirmation.entity';

@Injectable()
export class PasswordRecoveryConfirmationRepository {
  constructor(
    @InjectRepository(PasswordRecoveryConfirmation)
    private readonly passwordRecoveryConfirmationRepository: Repository<PasswordRecoveryConfirmation>,
  ) {}
  async findByRecoveryCodeOrNotFoundFail(
    confirmationCode: string,
  ): Promise<PasswordRecoveryConfirmation> {
    const result = await this.passwordRecoveryConfirmationRepository.findOne({
      where: {
        confirmationCode,
      },
    });

    if (!result) {
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

    return result;
  }

  async save(
    passwordRecoveryConfirmation: Omit<PasswordRecoveryConfirmation, 'id'> & {
      id?: number;
    },
  ): Promise<void> {
    await this.passwordRecoveryConfirmationRepository.upsert(
      passwordRecoveryConfirmation,
      ['userId'],
    );
  }
}
