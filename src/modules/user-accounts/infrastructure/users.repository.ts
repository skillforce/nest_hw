import { Injectable } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findById(id: string): Promise<User | null> {
    const query =
      'SELECT * FROM "Users" WHERE "id" = $1 AND "deletedAt" IS NULL';
    const result = await this.dataSource.query<User[]>(query, [id]);

    return result[0] ?? null;
  }
  async findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const query = 'SELECT * FROM "Users" WHERE "login" = $1 OR "email" = $1';

    const result = await this.dataSource.query<User[]>(query, [loginOrEmail]);

    return result[0] ?? null;
  }
  async findByLogin(login: string): Promise<User | null> {
    const query = 'SELECT * FROM "Users" WHERE "login" = $1';
    const result = await this.dataSource.query<User[]>(query, [login]);

    return result[0] ?? null;
  }
  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM "Users" WHERE "email" = $1';
    const result = await this.dataSource.query<User[]>(query, [email]);
    return result[0] ?? null;
  }
  async findByEmailOrNotFoundFail(email: string): Promise<User> {
    const query = 'SELECT * FROM "Users" WHERE "email" = $1';
    const result = await this.dataSource.query<User[]>(query, [email]);
    if (!result.length) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            field: 'email',
            message: 'user with such email does not exist',
          },
        ],
        message: 'user not found',
      });
    }

    return result[0];
  }
  async findByIdOrNotFoundFail(id: string): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'id',
            message: 'user not found',
          },
        ],
        message: 'user not found',
      });
    }

    return user;
  }

  async save(user: Omit<User, 'id'> & { id?: string }): Promise<string> {
    let query: string;
    let values: any[];

    const hasId = !!user.id;

    if (hasId) {
      query = `
      INSERT INTO "Users" ("id", "login", "email", "passwordHash", "deletedAt")
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT ("id") DO UPDATE SET
        "login" = EXCLUDED."login",
        "email" = EXCLUDED."email",
        "passwordHash" = EXCLUDED."passwordHash",
        "deletedAt" = EXCLUDED."deletedAt"
        RETURNING "id";
    `;
      values = [
        user.id,
        user.login,
        user.email,
        user.passwordHash,
        user.deletedAt ?? null,
      ];
    } else {
      query = `
      INSERT INTO "Users" ("login", "email", "passwordHash", "deletedAt")
      VALUES ($1, $2, $3, $4)
      RETURNING "id";
    `;
      values = [
        user.login,
        user.email,
        user.passwordHash,
        user.deletedAt ?? null,
      ];
    }

    const result = await this.dataSource.query<User[]>(query, values);

    return result[0].id;
  }
}
