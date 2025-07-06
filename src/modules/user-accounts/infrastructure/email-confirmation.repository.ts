import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailConfirmation } from '../domain/entities/email-confirmation.entity';

@Injectable()
export class EmailConfirmationRepository {
  constructor(
    @InjectRepository(EmailConfirmation)
    private readonly emailConfirmationRepository: Repository<EmailConfirmation>,
  ) {}
  async findByConfirmationCodeOrNotFoundFail(
    confirmationCode: string,
  ): Promise<EmailConfirmation> {
    const result = await this.emailConfirmationRepository.findOneBy({
      confirmationCode,
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

  async findByUserIdOrNotFoundFail(userId: number): Promise<EmailConfirmation> {
    const result = await this.emailConfirmationRepository.findOneBy({
      userId,
    });
    if (!result) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            field: 'userId',
            message: 'user id is not valid',
          },
        ],
        message: 'user id is not valid',
      });
    }

    return result;
  }

  async save(
    emailConfirmation: Omit<EmailConfirmation, 'id'> & { id?: number },
  ): Promise<number> {
    const result =
      await this.emailConfirmationRepository.save(emailConfirmation);

    return result.id;
  }
}
