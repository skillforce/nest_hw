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
import { GetPostsQueryParams } from './input-dto/post-input-dto/get-posts-query-params.input-dto';
import {
  CreatePostInputDto,
  UpdatePostInputDto,
} from './input-dto/post-input-dto/post.input-dto';
import { ApiParam } from '@nestjs/swagger';
import { PostsQueryRepository } from '../infrastructure/query/posts.query-repository';
import { PostsService } from '../application/posts-service';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { PostsViewDto } from './view-dto/posts.view-dto';
import { CommentsQueryRepository } from '../infrastructure/query/comments.query-repository';
import { GetCommentsQueryParams } from './input-dto/comment-input-dto/get-comments-query-params.input-dto';
import { CommentViewDto } from './view-dto/comments.view-dto';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postQueryRepository: PostsQueryRepository,
    private readonly postService: PostsService,
    private readonly blogQueryRepository: BlogsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':postId/comments')
  async getCommentsByPostId(
    @Query() query: GetCommentsQueryParams,
    @Param('postId') postId: string,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    return this.commentsQueryRepository.getAll(query, { postId });
  }

  async getAllPosts(
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    return this.postQueryRepository.getAll(query);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createPost(@Body() body: CreatePostInputDto): Promise<PostsViewDto> {
    const blog = await this.blogQueryRepository.getByIdOrNotFoundFail(
      body.blogId,
    );
    const createPostId = await this.postService.createPost({
      ...body,
      blogName: blog.name,
    });

    return this.postQueryRepository.getByIdOrNotFoundFail(createPostId);
  }

  @Get(':postId')
  async getPostById(@Param('postId') postId: string): Promise<PostsViewDto> {
    return this.postQueryRepository.getByIdOrNotFoundFail(postId);
  }

  @Put(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostById(
    @Param(':postId') postId: string,
    @Body() body: UpdatePostInputDto,
  ): Promise<void> {
    const blog = await this.blogQueryRepository.getByIdOrNotFoundFail(
      body.blogId,
    );

    await this.postService.updatePostById(postId, {
      ...body,
      blogName: blog.name,
    });
  }

  @ApiParam({ name: 'id' })
  @Delete(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlogById(@Param('postId') postId: string) {
    return await this.postService.deleteBlogById(postId);
  }
}
