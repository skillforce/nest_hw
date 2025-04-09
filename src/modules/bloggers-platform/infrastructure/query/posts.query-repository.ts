import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery } from 'mongoose';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { Post, PostModelType } from '../../domain/post.entity';
import { GetPostsQueryParams } from '../../api/input-dto/post-input-dto/get-posts-query-params.input-dto';
import { PostsViewDto } from '../../api/view-dto/posts.view-dto';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private readonly PostModel: PostModelType,
  ) {}
  async getByIdOrNotFoundFail(
    id: string,
  ): Promise<Omit<PostsViewDto, 'extendedLikesInfo'>> {
    const post = await this.PostModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!post) {
      throw new NotFoundException('post not found');
    }

    return PostsViewDto.mapToViewDto(post);
  }

  async getAll(
    query: GetPostsQueryParams,
    additionalFilters: FilterQuery<Post> = {},
  ): Promise<PaginatedViewDto<Omit<PostsViewDto, 'extendedLikesInfo'>[]>> {
    const filter: FilterQuery<Post> = {
      deletedAt: null,
      ...additionalFilters,
    };

    const posts = await this.PostModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.PostModel.countDocuments(filter);
    const items = posts.map(PostsViewDto.mapToViewDto);

    return PaginatedViewDto.mapToView({
      items,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }
}
