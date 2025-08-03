import { Injectable } from '@nestjs/common';
import { Blog } from '../../domain/blog.entity';
import { BlogsViewDto } from '../../api/view-dto/blogs.view-dto';
import { GetBlogsQueryParams } from '../../api/input-dto/blog-input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, IsNull, Repository } from 'typeorm';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsOrmRepository: Repository<Blog>,
  ) {}
  async getByIdOrNotFoundFail(id: number): Promise<BlogsViewDto> {
    if (isNaN(id)) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'blog',
            message: 'blog not found',
          },
        ],
        message: 'blog not found',
      });
    }

    const result = await this.blogsOrmRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });

    if (!result) {
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

    return BlogsViewDto.mapToViewDto(result);
  }

  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogsViewDto[]>> {
    const sortDirection =
      query.sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const skip = query.calculateSkip();
    const limit = query.pageSize;

    let whereConditions: FindOptionsWhere<Blog>[] = [];

    if (query.searchNameTerm) {
      whereConditions = [
        { deletedAt: IsNull(), name: ILike(`%${query.searchNameTerm}%`) },
      ];
    } else {
      whereConditions = [{ deletedAt: IsNull() }];
    }

    const [blogs, totalCount] = await this.blogsOrmRepository.findAndCount({
      where: whereConditions,
      order: { [query.sortBy]: sortDirection },
      skip,
      take: limit,
    });

    const items = blogs.map(BlogsViewDto.mapToViewDto);

    return PaginatedViewDto.mapToView({
      items,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }
}
