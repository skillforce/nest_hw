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
} from '@nestjs/common';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { GetBlogsQueryParams } from './input-dto/blog-input-dto/get-blogs-query-params.input-dto';
import { PostsQueryRepository } from '../infrastructure/query/posts.query-repository';
import { GetPostsQueryParams } from './input-dto/post-input-dto/get-posts-query-params.input-dto';
import {
  CreateBlogInputDto,
  UpdateBlogInputDto,
} from './input-dto/blog-input-dto/blog.input-dto';
import { ApiParam } from '@nestjs/swagger';
import {
  CreatePostByBlogIdInputDto,
  CreatePostInputDto,
} from './input-dto/post-input-dto/post.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { BlogsViewDto } from './view-dto/blogs.view-dto';
import { PostsViewDto } from './view-dto/posts.view-dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/usecases/create-post.usecase';
import { CreateBlogCommand } from '../application/usecases/create-blog.usecase';
import { UpdateBlogCommand } from '../application/usecases/update-blog.usecase';
import { DeleteBlogCommand } from '../application/usecases/delete-blog.usecase';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postQueryRepository: PostsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getAllBlogs(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogsViewDto[]>> {
    return this.blogsQueryRepository.getAll(query);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogsViewDto> {
    const blogId = await this.commandBus.execute<CreateBlogCommand, string>(
      new CreateBlogCommand(body),
    );

    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Get(':blogId/posts')
  async getPostsByBlogId(
    @Param('blogId') blogId: string,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);

    return this.postQueryRepository.getAll(query, { blogId });
  }

  @Post(':blogId/posts')
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

    return this.postQueryRepository.getByIdOrNotFoundFail(createdPostId);
  }

  @ApiParam({ name: 'id' })
  @Get(':blogId')
  async getBlogById(@Param('blogId') blogId: string): Promise<BlogsViewDto> {
    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Put(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlogById(
    @Param('blogId') blogId: string,
    @Body() body: UpdateBlogInputDto,
  ) {
    await this.commandBus.execute<UpdateBlogCommand, string>(
      new UpdateBlogCommand(blogId, body),
    );
  }

  @ApiParam({ name: 'id' })
  @Delete(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlogById(@Param('blogId') blogId: string) {
    await this.commandBus.execute<DeleteBlogCommand, void>(
      new DeleteBlogCommand(blogId),
    );
  }
}
