import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { Post } from '../../domain/post.entity';
import { GetPostsQueryParams } from '../../api/input-dto/post-input-dto/get-posts-query-params.input-dto';
import { PostsViewDto } from '../../api/view-dto/posts.view-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getByIdOrNotFoundFail(
    id: string,
  ): Promise<Omit<PostsViewDto, 'extendedLikesInfo'>> {
    const query =
      'SELECT p."id", p."title",  p."shortDescription", p."content", p."blogId",  b."name" as "blogName", p."createdAt" FROM "Posts" p LEFT JOIN "Blogs" b ON p."blogId"=b."id" WHERE p."id"= $1';

    const [post] = await this.dataSource.query<
      Array<Post & { blogName: string }>
    >(query, [id]);

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'post',
            message: 'post not found',
          },
        ],
        message: 'post not found',
      });
    }

    return PostsViewDto.mapToViewDto(post);
  }

  async getAll(
    query: GetPostsQueryParams,
    additionalFilters: FilterQuery<Post> = {},
  ): Promise<PaginatedViewDto<Omit<PostsViewDto, 'extendedLikesInfo'>[]>> {
    const sortDirection =
      query.sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const sortBy = query.sortBy;
    const skip = query.calculateSkip();
    const limit = query.pageSize;

    const values: any[] = [];
    let whereClause = `p."deletedAt" IS NULL`;

    if (additionalFilters.blogId) {
      values.push(additionalFilters.blogId);
      whereClause += ` AND "blogId" = $${values.length}`;
    }

    const countQuery = `
            SELECT COUNT(*) AS total
            FROM "Posts" p
            WHERE ${whereClause};
        `;
    const countResult = await this.dataSource.query<{ total: string }[]>(
      countQuery,
      values,
    );
    const totalCount = parseInt(countResult[0].total, 10);

    values.push(limit);
    values.push(skip);

    const postsQuery = `
            SELECT p."id",
                   p."title",
                   p."shortDescription",
                   p."content",
                   p."blogId",
                   b."name" as "blogName",
                   p."createdAt"
            FROM "Posts" p
                     LEFT JOIN "Blogs" b
                               ON p."blogId" = b."id"
            WHERE ${whereClause}
            ORDER BY "${sortBy}" ${sortDirection}
            LIMIT $${values.length - 1}
    OFFSET $${values.length}`;

    console.log(postsQuery);

    const posts = await this.dataSource.query<
      Array<Post & { blogName: string }>
    >(postsQuery, values);

    const items = posts.map(PostsViewDto.mapToViewDto);

    return PaginatedViewDto.mapToView({
      items,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }
}
