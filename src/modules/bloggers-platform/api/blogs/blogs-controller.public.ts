import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { BlogsQueryRepository } from '../../infrastructure/query/blogs.query-repository';
import { GetBlogsQueryParams } from '../input-dto/blog-input-dto/get-blogs-query-params.input-dto';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';
import { GetPostsQueryParams } from '../input-dto/post-input-dto/get-posts-query-params.input-dto';
import { ApiParam } from '@nestjs/swagger';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogsViewDto } from '../view-dto/blogs.view-dto';
import { PostsViewDto } from '../view-dto/posts.view-dto';
import { LikesQueryRepository } from '../../infrastructure/query/likes.query-repository';
import { ExtractUserFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtOptionalAuthGuard } from '../../../user-accounts/guards/bearer/jwt-optional-auth.guard';

@SkipThrottle()
@Controller('blogs')
export class BlogsPublicController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postQueryRepository: PostsQueryRepository,
    private readonly likesQueryRepository: LikesQueryRepository,
  ) {}

  @Get()
  async getAllBlogs(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogsViewDto[]>> {
    return this.blogsQueryRepository.getAll(query);
  }

  @Get(':blogId/posts')
  @UseGuards(JwtOptionalAuthGuard)
  async getPostsByBlogId(
    @Param('blogId') blogId: string,
    @Query() query: GetPostsQueryParams,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);

    const paginatedPosts = await this.postQueryRepository.getAll(query, {
      blogId,
    });
    const postsLikesInfo = await this.likesQueryRepository.getBulkLikesInfo({
      parentIds: paginatedPosts.items.map((post) => Number(post.id)),
      userId: user?.id,
    });
    const postsNewestLikes =
      await this.likesQueryRepository.getBulkNewestLikesInfo(
        paginatedPosts.items.map((post) => Number(post.id)),
      );
    return {
      ...paginatedPosts,
      items: PostsViewDto.mapPostsToViewWithLikesInfo(
        paginatedPosts.items,
        postsLikesInfo,
        postsNewestLikes,
      ),
    };
  }

  @ApiParam({ name: 'id' })
  @Get(':blogId')
  async getBlogById(@Param('blogId') blogId: string): Promise<BlogsViewDto> {
    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }
}
