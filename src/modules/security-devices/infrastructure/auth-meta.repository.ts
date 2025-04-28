import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { AuthMeta } from '../domain/auth-meta.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthMetaRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async findManyByDeviceIdOrNotFoundFail(device_id: string) {
    const query = `SELECT * FROM "UserSessions" WHERE "deviceId" = $1 AND "deletedAt" IS NULL`;

    const sessions = await this.dataSource.query<AuthMeta[]>(query, [
      device_id,
    ]);

    if (!sessions.length) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'refreshToken',
            message: 'session does not exist',
          },
        ],
        message: 'session not found',
      });
    }

    return sessions;
  }
  async markAllSessionsAsDeletedExceptWithDeviceId(
    user_id: string,
    device_id: string,
  ): Promise<void> {
    const deletedAt = new Date().toISOString();

    const query = `UPDATE "UserSessions" SET "deletedAt" = $1 WHERE "userId" = $2 AND "deviceId" != $3 AND "deletedAt" IS NULL`;

    return this.dataSource.query(query, [deletedAt, user_id, device_id]);
  }

  async save(session: Omit<AuthMeta, 'id'> & { id?: string }): Promise<string> {
    let query: string;
    let values: any[];

    const hasId = !!session.id;

    if (hasId) {
      query = `
      INSERT INTO "UserSessions" 
        ("id", "iat", "exp", "deletedAt")
      VALUES 
        ($1, $2, $3, $4)
      ON CONFLICT ("id") DO UPDATE SET
        "iat" = EXCLUDED."iat",
        "exp" = EXCLUDED."exp",
        "deletedAt" = EXCLUDED."deletedAt"
      RETURNING "id";
    `;
      values = [
        session.id,
        session.iat,
        session.exp,
        session.deletedAt ?? null,
      ];
    } else {
      query = `
      INSERT INTO "UserSessions" 
        ("iat", "userId", "deviceId", "exp", "deviceName", "ipAddress", "deletedAt", "createdAt")
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING "id";
    `;
      values = [
        session.iat,
        session.userId,
        session.deviceId,
        session.exp,
        session.deviceName,
        session.ipAddress,
        session.deletedAt ?? null,
        session.createdAt ?? new Date(),
      ];
    }

    const result = await this.dataSource.query<{ id: string }[]>(query, values);

    return result[0].id;
  }
}
