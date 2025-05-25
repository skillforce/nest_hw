import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCommentDto } from '../../domain/dto/comment-domain.dto';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import { Comment } from '../../domain/comment.entity';
import { User } from '../../../user-accounts/domain/user.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export class UpdateCommentCommand {
  constructor(
    public updateCommentDto: UpdateCommentDto,
    public commentId: number,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand, void>
{
  constructor(
    private commentsRepository: CommentsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    updateCommentDto,
    commentId,
    userId,
  }: UpdateCommentCommand): Promise<void> {
    if (isNaN(commentId)) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'comment',
            message: 'comment not found',
          },
        ],
        message: 'comment not found',
      });
    }
    const comment = await this.commentsRepository.findOrNotFoundFail(commentId);
    const user = await this.usersRepository.findByIdOrNotFoundFail(userId);

    if (!this.isUserOwnUpdatedComment(comment, user)) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'user is not owner of comment',
      });
    }

    const updatedComment = this.updateComment(comment, updateCommentDto);

    await this.commentsRepository.save(updatedComment);
  }

  private isUserOwnUpdatedComment(comment: Comment, user: User) {
    return comment.creatorId === user.id;
  }
  private updateComment(
    commentToUpdate: Comment,
    updateCommentDto: UpdateCommentDto,
  ) {
    return {
      ...commentToUpdate,
      content: updateCommentDto.content,
    };
  }
}
