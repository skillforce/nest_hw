import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { Post } from '../../domain/post.entity';
import { GetPostsQueryParams } from '../../api/input-dto/post-input-dto/get-posts-query-params.input-dto';
import { PostsViewDto } from '../../api/view-dto/posts.view-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postsOrmRepository: Repository<Post>,
  ) {}

  async getByIdOrNotFoundFail(
    id: number,
  ): Promise<Omit<PostsViewDto, 'extendedLikesInfo'>> {
    if (isNaN(id)) {
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

    const sql = this.postsOrmRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.blog', 'blog')
      .where('post.id = :id', { id })
      .andWhere('post.deletedAt IS NULL')
      .select([
        'post.id',
        'post.title',
        'post.shortDescription',
        'post.content',
        'post.blogId',
        'post.createdAt',
        'blog.name',
      ])
      .getSql();

    console.log(sql);

    const result = await this.postsOrmRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.blog', 'blog')
      .where('post.id = :id', { id })
      .andWhere('post.deletedAt IS NULL')
      .select([
        'post.id',
        'post.title',
        'post.shortDescription',
        'post.content',
        'post.blogId',
        'post.createdAt',
        'blog.name',
      ])
      .getOne();

    if (!result) {
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

    return PostsViewDto.mapToViewDto(result as Post & { blogName: string });
  }

  async getAll(
    query: GetPostsQueryParams,
    additionalFilters: FilterQuery<Post> = {},
  ): Promise<PaginatedViewDto<Omit<PostsViewDto, 'extendedLikesInfo'>[]>> {
    const sortDirection =
      query.sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const skip = query.calculateSkip();
    const limit = query.pageSize;

    let whereConditions: FindOptionsWhere<Post>[] = [];

    if (additionalFilters.blogId) {
      whereConditions = [
        { deletedAt: IsNull(), blogId: additionalFilters.blogId },
      ];
    } else {
      whereConditions = [{ deletedAt: IsNull() }];
    }

    const [posts, totalCount] = await this.postsOrmRepository.findAndCount({
      where: whereConditions,
      order: { [query.sortBy]: sortDirection },
      skip,
      take: limit,
    });

    const items = posts.map(PostsViewDto.mapToViewDto);

    return PaginatedViewDto.mapToView({
      items,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }
}
