import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PasswordRecoveryConfirmation } from '../domain/schemas/password-recovery-confirmation.schema';

@Injectable()
export class PasswordRecoveryConfirmationRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async findByRecoveryCodeOrNotFoundFail(
    confirmationCode: string,
  ): Promise<PasswordRecoveryConfirmation> {
    const getPasswordRecoveryConfirmationCodeQuery =
      'SELECT * FROM "PasswordRecoveryConfirmations" WHERE "confirmationCode" = $1';
    const result = await this.dataSource.query<PasswordRecoveryConfirmation[]>(
      getPasswordRecoveryConfirmationCodeQuery,
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

  async save(
    passwordRecoveryConfirmation: PasswordRecoveryConfirmation,
  ): Promise<string> {
    let query: string;
    let values: any[];

    const hasId = !!passwordRecoveryConfirmation.id;

    if (hasId) {
      query = `
      INSERT INTO "PasswordRecoveryConfirmations" ("id", "confirmationCode", "confirmationExpiresAt", "userId", "isConfirmed")
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT ("userId") DO UPDATE SET
        "confirmationCode" = EXCLUDED."confirmationCode",
        "confirmationExpiresAt" = EXCLUDED."confirmationExpiresAt",
        "isConfirmed" = EXCLUDED."isConfirmed"
        RETURNING "id";
    `;
      values = [
        passwordRecoveryConfirmation.id,
        passwordRecoveryConfirmation.confirmationCode,
        passwordRecoveryConfirmation.confirmationExpiresAt,
        passwordRecoveryConfirmation.userId,
        passwordRecoveryConfirmation.isConfirmed,
      ];
    } else {
      query = `
          INSERT INTO "EmailConfirmations" ("confirmationCode", "confirmationExpiresAt", "userId")
          VALUES ($1, $2, $3)
           RETURNING "id";
    `;
      values = [
        passwordRecoveryConfirmation.confirmationCode,
        passwordRecoveryConfirmation.confirmationExpiresAt,
        passwordRecoveryConfirmation.userId,
      ];
    }

    const result = await this.dataSource.query(query, values);

    return result[0].id;
  }
}
