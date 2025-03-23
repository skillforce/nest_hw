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
import { BlogsService } from '../application/blogs-service';
import { GetBlogsQueryParams } from './input-dto/blog-input-dto/get-blogs-query-params.input-dto';
import { PostsQueryRepository } from '../infrastructure/query/posts.query-repository';
import { GetPostsQueryParams } from './input-dto/post-input-dto/get-posts-query-params.input-dto';
import {
  CreateBlogInputDto,
  UpdateBlogInputDto,
} from './input-dto/blog-input-dto/blog.input-dto';
import { PostsService } from '../application/posts-service';
import { ApiParam } from '@nestjs/swagger';
import { CreatePostByBlogIdInputDto } from './input-dto/post-input-dto/post.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { BlogsViewDto } from './view-dto/blogs.view-dto';
import { PostsViewDto } from './view-dto/posts.view-dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postQueryRepository: PostsQueryRepository,
    private readonly blogsService: BlogsService,
    private readonly postService: PostsService,
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
    const blogId = await this.blogsService.createBlog(body);

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
    const blog = await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);

    const postId = await this.postService.createPost({
      ...body,
      blogId,
      blogName: blog.name,
    });

    return this.postQueryRepository.getByIdOrNotFoundFail(postId);
  }

  @ApiParam({ name: 'id' })
  @Get(':blogId')
  async getBlogById(@Param('blogId') blogId: string): Promise<BlogsViewDto> {
    console.log(blogId);
    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Put(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlogById(
    @Param('blogId') blogId: string,
    @Body() body: UpdateBlogInputDto,
  ): Promise<void> {
    await this.blogsService.updateBlogById(blogId, body);
  }

  @ApiParam({ name: 'id' })
  @Delete(':blogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlogById(@Param('blogId') blogId: string) {
    return await this.blogsService.deleteBlogById(blogId);
  }
}
