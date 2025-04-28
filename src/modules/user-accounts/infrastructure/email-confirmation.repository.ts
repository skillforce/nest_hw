import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EmailConfirmation } from '../domain/schemas/email-confirmation.schema';

@Injectable()
export class EmailConfirmationRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async findByConfirmationCodeOrNotFoundFail(
    confirmationCode: string,
  ): Promise<EmailConfirmation> {
    const getEmailConfirmationCodeQuery =
      'SELECT * FROM "EmailConfirmations" WHERE "confirmationCode" = $1';
    const result = await this.dataSource.query<EmailConfirmation[]>(
      getEmailConfirmationCodeQuery,
      [confirmationCode],
    );

    if (!result[0]) {
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

    return result[0];
  }

  async findByUserIdOrNotFoundFail(userId: string): Promise<EmailConfirmation> {
    const query = 'SELECT * FROM "EmailConfirmations" WHERE "userId" = $1';
    const result = await this.dataSource.query<EmailConfirmation[]>(query, [
      userId,
    ]);
    if (!result[0]) {
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

    return result[0];
  }

  async save(emailConfirmation: EmailConfirmation): Promise<string> {
    const query = `
      INSERT INTO "EmailConfirmations" ( "confirmationCode", "confirmationExpiresAt", "isConfirmed", "userId")
      VALUES ($1, $2, $3, $4)
      ON CONFLICT ("userId") DO UPDATE SET
        "confirmationCode" = EXCLUDED."confirmationCode",
        "confirmationExpiresAt" = EXCLUDED."confirmationExpiresAt",
        "isConfirmed" = EXCLUDED."isConfirmed"
        RETURNING "id";
    `;

    const values = [
      emailConfirmation.confirmationCode,
      emailConfirmation.confirmationExpiresAt,
      emailConfirmation.isConfirmed,
      emailConfirmation.userId,
    ];

    const result = await this.dataSource.query(query, values);

    return result[0].id;
  }
}
