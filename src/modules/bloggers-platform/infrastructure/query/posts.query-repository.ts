import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { Post } from '../../domain/post.entity';
import { GetPostsQueryParams } from '../../api/input-dto/post-input-dto/get-posts-query-params.input-dto';
import { PostsViewDto } from '../../api/view-dto/posts.view-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsSortBy } from '../../api/input-dto/post-input-dto/posts-sort-by';

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

    const qb = this.postsOrmRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.blog', 'blog')
      .where('post.deletedAt IS NULL');

    if (additionalFilters.blogId) {
      qb.andWhere('post.blogId = :blogId', {
        blogId: +additionalFilters.blogId,
      });
    }

    const sortBy = query.sortBy;

    if (sortBy === PostsSortBy.blogName) {
      qb.orderBy('blog.name', sortDirection);
    } else {
      qb.orderBy(`post.${sortBy}`, sortDirection);
    }

    qb.skip(skip).take(limit);

    const [posts, totalCount] = await qb.getManyAndCount();
    const items = posts.map(PostsViewDto.mapToViewDto);

    return PaginatedViewDto.mapToView({
      items,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }
}
