import { Injectable } from '@nestjs/common';
import { Blog } from '../../domain/blog.entity';
import { BlogsViewDto } from '../../api/view-dto/blogs.view-dto';
import { GetBlogsQueryParams } from '../../api/input-dto/blog-input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async getByIdOrNotFoundFail(id: string): Promise<BlogsViewDto> {
    const query =
      'SELECT * FROM "Blogs" WHERE "id" = $1 AND "deletedAt" IS NULL';

    const result = await this.dataSource.query<Blog[]>(query, [id]);

    if (!result.length) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `Blog with id ${id} not found`,
        extensions: [
          {
            field: 'blog',
            message: `Blog with id ${id} not found`,
          },
        ],
      });
    }

    return BlogsViewDto.mapToViewDto(result[0]);
  }

  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogsViewDto[]>> {
    const sortDirection =
      query.sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const sortBy = query.sortBy;
    const skip = query.calculateSkip();
    const limit = query.pageSize;

    const values: any[] = [];
    let whereClause = `"deletedAt" IS NULL`;

    if (query.searchNameTerm) {
      values.push(`%${query.searchNameTerm}%`);
      whereClause += ` AND "name" ILIKE $${values.length}`;
    }

    const countQuery = `
    SELECT COUNT(*) AS total
    FROM "Blogs"
    WHERE ${whereClause};
  `;
    const countResult = await this.dataSource.query<{ total: string }[]>(
      countQuery,
      values,
    );
    const totalCount = parseInt(countResult[0].total, 10);

    values.push(limit);
    values.push(skip);
    const getBlogsQuery = `
    SELECT *
    FROM "Blogs"
    WHERE ${whereClause}
    ORDER BY "${sortBy}" ${sortDirection}
    LIMIT $${values.length - 1}
    OFFSET $${values.length};
  `;

    const blogs = await this.dataSource.query<Blog[]>(getBlogsQuery, values);

    const items = blogs.map(BlogsViewDto.mapToViewDto);

    return {
      pagesCount: Math.ceil(totalCount / limit),
      page: query.pageNumber,
      pageSize: limit,
      totalCount,
      items,
    };
  }
}
