import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../domain/user.entity';
import { UserViewDto } from '../../api/view-dto/users-view-dto/users.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/users-input-dto/get-users-query-params.input-dto';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async getByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    const userResult = await this.dataSource.query<User[]>(
      'SELECT * FROM "Users" WHERE "id" = $1 AND "deletedAt" IS NULL',
      [id],
    );

    if (!userResult.length) {
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

    return UserViewDto.mapToViewDto(userResult[0]);
  }

  async getAllUsers(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const sortDirection =
      query.sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const sortBy = query.sortBy;
    const skip = query.calculateSkip();
    const limit = query.pageSize;

    const values: any[] = [];
    let whereClause = `"deletedAt" IS NULL`;

    if (query.searchLoginTerm) {
      values.push(`%${query.searchLoginTerm}%`);
      whereClause += ` AND "login" ILIKE $${values.length}`;
    }

    if (query.searchEmailTerm) {
      values.push(`%${query.searchEmailTerm}%`);
      whereClause += ` AND "email" ILIKE $${values.length}`;
    }

    // Count query for pagination
    const countQuery = `
    SELECT COUNT(*) AS total
    FROM "Users"
    WHERE ${whereClause};
  `;
    const countResult = await this.dataSource.query(countQuery, values);
    const totalCount = parseInt(countResult[0].total, 10);

    values.push(limit);
    values.push(skip);
    const getUsersQuery = `
    SELECT *
    FROM "Users"
    WHERE ${whereClause}
    ORDER BY "${sortBy}" ${sortDirection}
    LIMIT $${values.length - 1}
    OFFSET $${values.length};
  `;

    const users = await this.dataSource.query<User[]>(getUsersQuery, values);

    const items = users.map(UserViewDto.mapToViewDto);

    return PaginatedViewDto.mapToView({
      items,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }
}
