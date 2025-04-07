import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsQueryRepository } from '../infrastructure/query/comments.query-repository';
import { CommentViewDto } from './view-dto/comments.view-dto';
import { JwtAuthGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import { UpdateCommentInputDto } from './input-dto/comment-input-dto/comment.input-dto';
import { ExtractUserFromRequest } from '../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../user-accounts/guards/dto/user-context.dto';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from '../application/usecases/update-comment.usecase';
import { DeleteCommentCommand } from '../application/usecases/delete-comment.usecase';
import { LikeInputDto } from './input-dto/like-input-dto/like.input-dto';
import { MakeLikeOperationCommand } from '../application/usecases/make-like-operation.usecase';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(':commentId')
  async getCommentById(
    @Param('commentId') commentId: string,
  ): Promise<CommentViewDto> {
    return this.commentsQueryRepository.getByIdOrNotFoundFail(commentId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Put(':commentId')
  async updateComment(
    @Body() body: UpdateCommentInputDto,
    @Param('commentId') commentId: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ) {
    await this.commandBus.execute<UpdateCommentCommand, void>(
      new UpdateCommentCommand(body, commentId, user.id),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Put(':commentId/like-status')
  async makeLike(
    @Body() body: LikeInputDto,
    @Param('commentId') commentId: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ) {
    await this.commandBus.execute<MakeLikeOperationCommand, void>(
      new MakeLikeOperationCommand(body, user.id, commentId),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  async deleteComment(
    @Param('commentId') commentId: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ) {
    await this.commandBus.execute<DeleteCommentCommand, void>(
      new DeleteCommentCommand(commentId, user.id),
    );
  }
}
