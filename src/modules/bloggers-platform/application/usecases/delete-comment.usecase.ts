import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import { User } from '../../../user-accounts/domain/entities/user.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { Comment } from '../../domain/comment.entity';

export class DeleteCommentCommand {
  constructor(
    public commentId: number,
    public userId: number,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand, void>
{
  constructor(
    private commentsRepository: CommentsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ commentId, userId }: DeleteCommentCommand): Promise<void> {
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
    if (!this.isUserOwnDeletedComment(comment, user)) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'user is not owner of the comment',
      });
    }
    const deletedComment = this.makeDeleted(comment);

    await this.commentsRepository.save(deletedComment);
  }

  private isUserOwnDeletedComment(comment: Comment, user: User) {
    return comment.creatorId === user.id;
  }

  private makeDeleted(commentToDelete: Comment): Comment {
    if (commentToDelete.deletedAt !== null) {
      throw new Error('Comment already deleted');
    }
    return {
      ...commentToDelete,
      deletedAt: new Date(),
    };
  }
}
