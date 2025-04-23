import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import { CommentDocument } from '../../domain/comment.entity';
import { User, UserDocument } from '../../../user-accounts/domain/user.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
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
    const comment = await this.commentsRepository.findOrNotFoundFail(commentId);
    const user = await this.usersRepository.findByIdOrNotFoundFail(userId);
    if (!this.isUserOwnDeletedComment(comment, user)) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'user is not owner of the comment',
      });
    }

    comment.makeDeleted();

    await this.commentsRepository.save(comment);
  }

  private isUserOwnDeletedComment(comment: CommentDocument, user: User) {
    return comment.commentatorInfo.userId === user.id;
  }
}
