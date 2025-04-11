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
import { LikesQueryRepository } from '../infrastructure/query/likes.query-repository';
import { JwtOptionalAuthGuard } from '../../user-accounts/guards/bearer/jwt-optional-auth.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { BasicAuthGuard } from '../../user-accounts/guards/basic/basic-auth.guard';
import { IdParamDto } from '../../../core/decorators/validation/objectIdDto';

@SkipThrottle()
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly likesQueryRepository: LikesQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(':postId/comments')
  @UseGuards(JwtOptionalAuthGuard)
  async getCommentsByPostId(
    @Query() query: GetCommentsQueryParams,
    @Param('postId') postId: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const commentsPaginatedData = await this.commentsQueryRepository.getAll(
      query,
      {
        postId,
      },
    );
    const commentsLikesInfo = await this.likesQueryRepository.getBulkLikesInfo({
      parentIds: commentsPaginatedData.items.map((comment) => comment.id),
      userId: user?.id,
    });
    return {
      ...commentsPaginatedData,
      items: CommentViewDto.mapCommentsToViewWithLikesInfo(
        commentsPaginatedData.items,
        commentsLikesInfo,
      ),
    };
  }

  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  async getAllPosts(
    @Query() query: GetPostsQueryParams,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    const paginatedPosts = await this.postQueryRepository.getAll(query);
    const postsLikesInfo = await this.likesQueryRepository.getBulkLikesInfo({
      parentIds: paginatedPosts.items.map((post) => post.id),
      userId: user?.id,
    });
    const newestLikes = await this.likesQueryRepository.getBulkNewestLikesInfo(
      paginatedPosts.items.map((post) => post.id),
    );
    return {
      ...paginatedPosts,
      items: PostsViewDto.mapPostsToViewWithLikesInfo(
        paginatedPosts.items,
        postsLikesInfo,
        newestLikes,
      ),
    };
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createPost(@Body() body: CreatePostInputDto): Promise<PostsViewDto> {
    const createPostId = await this.commandBus.execute<
      CreatePostCommand,
      string
    >(new CreatePostCommand(body));

    const post =
      await this.postQueryRepository.getByIdOrNotFoundFail(createPostId);
    const likesInfo =
      await this.likesQueryRepository.getEntityLikesInfo(createPostId);
    const newestLikes =
      await this.likesQueryRepository.getNewestLikesForEntity(createPostId);

    return PostsViewDto.mapToViewWithLikesInfo(post, likesInfo, newestLikes);
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

    const createdComment =
      await this.commentsQueryRepository.getByIdOrNotFoundFail(
        createdCommentId,
      );

    const likeInfo = await this.likesQueryRepository.getEntityLikesInfo(
      createdCommentId,
      user.id,
    );

    return CommentViewDto.mapToViewWithLikesInfo(createdComment, likeInfo);
  }

  @Get(':postId')
  @UseGuards(JwtOptionalAuthGuard)
  async getPostById(
    @Param('postId') postId: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<PostsViewDto> {
    const post = await this.postQueryRepository.getByIdOrNotFoundFail(postId);
    const postLikesInfo = await this.likesQueryRepository.getEntityLikesInfo(
      postId,
      user?.id,
    );
    const newestLikes =
      await this.likesQueryRepository.getNewestLikesForEntity(postId);

    return PostsViewDto.mapToViewWithLikesInfo(
      post,
      postLikesInfo,
      newestLikes,
    );
  }

  @Put(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
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
  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlogById(@Param() { id }: IdParamDto) {
    return await this.commandBus.execute<DeletePostCommand, void>(
      new DeletePostCommand(id),
    );
  }
}
