import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsQueryRepository } from '../../infrastructure/query/blogs.query-repository';
import { GetBlogsQueryParams } from '../input-dto/blog-input-dto/get-blogs-query-params.input-dto';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';
import { GetPostsQueryParams } from '../input-dto/post-input-dto/get-posts-query-params.input-dto';
import {
  CreateBlogInputDto,
  UpdateBlogInputDto,
} from '../input-dto/blog-input-dto/blog.input-dto';
import { ApiParam } from '@nestjs/swagger';
import {
  CreatePostByBlogIdInputDto,
  CreatePostInputDto,
} from '../input-dto/post-input-dto/post.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogsViewDto } from '../view-dto/blogs.view-dto';
import { PostsViewDto } from '../view-dto/posts.view-dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../../application/usecases/create-post.usecase';
import { CreateBlogCommand } from '../../application/usecases/create-blog.usecase';
import { UpdateBlogCommand } from '../../application/usecases/update-blog.usecase';
import { DeleteBlogCommand } from '../../application/usecases/delete-blog.usecase';
import { LikesQueryRepository } from '../../infrastructure/query/likes.query-repository';
import { JwtOptionalAuthGuard } from '../../../user-accounts/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import { BasicAuthGuard } from '../../../user-accounts/guards/basic/basic-auth.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { IdStringParamDto } from '../../../../core/decorators/validation/objectIdDto';

@SkipThrottle()
@Controller('sa/blogs')
export class BlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postQueryRepository: PostsQueryRepository,
    private readonly likesQueryRepository: LikesQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  async getAllBlogs(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogsViewDto[]>> {
    return this.blogsQueryRepository.getAll(query);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @UseGuards(BasicAuthGuard)
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogsViewDto> {
    const blogId = await this.commandBus.execute<CreateBlogCommand, string>(
      new CreateBlogCommand(body),
    );

    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Get(':blogId/posts')
  @UseGuards(JwtOptionalAuthGuard)
  @UseGuards(BasicAuthGuard)
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
      parentIds: paginatedPosts.items.map((post) => post.id),
      userId: user?.id,
    });
    const postsNewestLikes =
      await this.likesQueryRepository.getBulkNewestLikesInfo(
        paginatedPosts.items.map((post) => post.id),
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

  @Post(':blogId/posts')
  @UseGuards(BasicAuthGuard)
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() body: CreatePostByBlogIdInputDto,
  ): Promise<PostsViewDto> {
    const postDto: CreatePostInputDto = {
      ...body,
      blogId,
    };

    const createdPostId = await this.commandBus.execute<
      CreatePostCommand,
      string
    >(new CreatePostCommand(postDto));

    const post =
      await this.postQueryRepository.getByIdOrNotFoundFail(createdPostId);

    const postLikesInfo =
      await this.likesQueryRepository.getEntityLikesInfo(createdPostId);
    const newestLikes =
      await this.likesQueryRepository.getNewestLikesForEntity(createdPostId);

    return PostsViewDto.mapToViewWithLikesInfo(
      post,
      postLikesInfo,
      newestLikes,
    );
  }

  @ApiParam({ name: 'id' })
  @UseGuards(BasicAuthGuard)
  @Get(':blogId')
  async getBlogById(@Param('blogId') blogId: string): Promise<BlogsViewDto> {
    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Put(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async updateBlogById(
    @Param('blogId') blogId: string,
    @Body() body: UpdateBlogInputDto,
  ) {
    await this.commandBus.execute<UpdateBlogCommand, string>(
      new UpdateBlogCommand(blogId, body),
    );
  }

  @ApiParam({ name: 'id' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async deleteBlogById(@Param() { id }: IdStringParamDto) {
    await this.commandBus.execute<DeleteBlogCommand, void>(
      new DeleteBlogCommand(id),
    );
  }
}
