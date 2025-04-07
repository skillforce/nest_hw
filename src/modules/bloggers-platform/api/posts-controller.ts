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
import { GetPostsQueryParams } from './input-dto/post-input-dto/get-posts-query-params.input-dto';
import {
  CreatePostInputDto,
  UpdatePostInputDto,
} from './input-dto/post-input-dto/post.input-dto';
import { ApiParam } from '@nestjs/swagger';
import { PostsQueryRepository } from '../infrastructure/query/posts.query-repository';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { PostsViewDto } from './view-dto/posts.view-dto';
import { CommentsQueryRepository } from '../infrastructure/query/comments.query-repository';
import { GetCommentsQueryParams } from './input-dto/comment-input-dto/get-comments-query-params.input-dto';
import { CommentViewDto } from './view-dto/comments.view-dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/usecases/create-post.usecase';
import { UpdatePostCommand } from '../application/usecases/update-post.usecase';
import { DeletePostCommand } from '../application/usecases/delete-post.usecase';
import { CreateCommentInputDto } from './input-dto/comment-input-dto/comment.input-dto';
import { CreateCommentCommand } from '../application/usecases/create-comment.usecase';
import { JwtAuthGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../user-accounts/guards/dto/user-context.dto';
import { LikeInputDto } from './input-dto/like-input-dto/like.input-dto';
import { MakeLikeOperationCommand } from '../application/usecases/make-like-operation.usecase';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(':postId/comments')
  async getCommentsByPostId(
    @Query() query: GetCommentsQueryParams,
    @Param('postId') postId: string,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    return this.commentsQueryRepository.getAll(query, { postId });
  }
  @Get()
  async getAllPosts(
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    return this.postQueryRepository.getAll(query);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createPost(@Body() body: CreatePostInputDto): Promise<PostsViewDto> {
    const createPostId = await this.commandBus.execute<
      CreatePostCommand,
      string
    >(new CreatePostCommand(body));

    return this.postQueryRepository.getByIdOrNotFoundFail(createPostId);
  }

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @Post(':postId/comments')
  async commentPost(
    @Body() body: CreateCommentInputDto,
    @Param('postId') postId: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<CommentViewDto> {
    const createdCommentId = await this.commandBus.execute<
      CreateCommentCommand,
      string
    >(new CreateCommentCommand(body, postId, user.id));

    return this.commentsQueryRepository.getByIdOrNotFoundFail(createdCommentId);
  }

  @Get(':postId')
  async getPostById(@Param('postId') postId: string): Promise<PostsViewDto> {
    return this.postQueryRepository.getByIdOrNotFoundFail(postId);
  }

  @Put(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostById(
    @Param('postId') postId: string,
    @Body() body: UpdatePostInputDto,
  ): Promise<void> {
    return await this.commandBus.execute<UpdatePostCommand, void>(
      new UpdatePostCommand(postId, body),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Put(':postId/like-status')
  async makeLike(
    @Body() body: LikeInputDto,
    @Param('postId') postId: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ) {
    await this.commandBus.execute<MakeLikeOperationCommand, void>(
      new MakeLikeOperationCommand(body, user.id, postId),
    );
  }

  @ApiParam({ name: 'id' })
  @Delete(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlogById(@Param('postId') postId: string) {
    return await this.commandBus.execute<DeletePostCommand, void>(
      new DeletePostCommand(postId),
    );
  }
}
