import { Injectable } from '@nestjs/common';
import { AuthMeta } from '../../domain/auth-meta.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class ExternalAuthMetaRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async findByDeviceIdAndUserIdAndIatOrNotFoundFail(
    device_id: string,
    user_id: string,
    iat: string,
  ) {
    const query =
      'SELECT * FROM "UserSessions" WHERE "userId"= $1 AND "deviceId" =$2 AND iat=$3 AND "deletedAt" IS NULL';
    const session = await this.dataSource.query<AuthMeta[]>(query, [
      user_id,
      device_id,
      iat,
    ]);
    if (!session.length) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        extensions: [
          {
            field: 'session',
            message: 'session does not exist',
          },
        ],
        message: 'session not found',
      });
    }

    return session[0];
  }

  async save(session: Omit<AuthMeta, 'id'> & { id?: string }): Promise<string> {
    const query = `
      INSERT INTO "UserSessions"
      ("iat", "userId", "deviceId", "exp", "deviceName", "ipAddress", "deletedAt", "createdAt")
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT ("deviceId") DO UPDATE SET
        "iat" = EXCLUDED."iat",
        "exp" = EXCLUDED."exp",
        "deletedAt" = EXCLUDED."deletedAt"
      RETURNING "id";
    `;
    const values = [
      session.iat,
      session.userId,
      session.deviceId,
      session.exp,
      session.deviceName,
      session.ipAddress,
      session.deletedAt ?? null,
      session.createdAt ?? new Date(),
    ];

    const result = await this.dataSource.query<{ id: string }[]>(query, values);

    return result[0].id;
  }
}
