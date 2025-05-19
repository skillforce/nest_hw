import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { Comment } from '../../domain/comment.entity';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { GetCommentsQueryParams } from '../../api/input-dto/comment-input-dto/get-comments-query-params.input-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../../../user-accounts/domain/user.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async getByIdOrNotFoundFail(
    id: number,
  ): Promise<Omit<CommentViewDto, 'likesInfo'>> {
    const query =
      'SELECT * FROM "Comments" c INNER JOIN "Users" u ON c."creatorId" = u."id" WHERE c."id" = $1 AND c."deletedAt" IS NULL';

    const result = await this.dataSource.query<Array<Comment & User>>(query, [
      id,
    ]);

    if (!result.length) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'comment',
            message: 'comment not found',
          },
        ],
        message: 'comment not found',
      });
    }

    return CommentViewDto.mapToViewDto(result[0]);
  }

  async getAll(
    query: GetCommentsQueryParams,
    additionalFilter: FilterQuery<Comment> = {},
  ): Promise<PaginatedViewDto<Omit<CommentViewDto, 'likesInfo'>[]>> {
    const sortDirection =
      query.sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const sortBy = query.sortBy;
    const skip = query.calculateSkip();
    const limit = query.pageSize;

    const values: any[] = [];
    let whereClause = `c."deletedAt" IS NULL`;

    if (additionalFilter.postId) {
      values.push(additionalFilter.postId);
      whereClause += ` AND "postId" = $${values.length}`;
    }

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM "Comments" c
      WHERE ${whereClause};
    `;
    const countResult = await this.dataSource.query<{ total: string }[]>(
      countQuery,
      values,
    );
    const totalCount = parseInt(countResult[0].total, 10);

    values.push(limit);
    values.push(skip);

    const commentsQuery = `
            SELECT c."id",
                   c."content",
                   c."createdAt",
                   c."creatorId",
                   u."login"
            FROM "Comments" c
                     LEFT JOIN "Users" u
                               ON c."creatorId" = u."id"
            WHERE ${whereClause}
            ORDER BY "${sortBy}" ${sortDirection}
            LIMIT $${values.length - 1}
    OFFSET $${values.length}`;

    const comments = await this.dataSource.query<
      Array<Comment & { login: string }>
    >(commentsQuery, values);

    const items = comments.map(CommentViewDto.mapToViewDto);

    return PaginatedViewDto.mapToView({
      items,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }
}
