import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCommentDto } from '../../domain/dto/comment-domain.dto';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import { CommentDocument } from '../../domain/comment.entity';
import { User, UserDocument } from '../../../user-accounts/domain/user.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export class UpdateCommentCommand {
  constructor(
    public updateCommentDto: UpdateCommentDto,
    public commentId: string,
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
    const comment = await this.commentsRepository.findOrNotFoundFail(commentId);
    const user = await this.usersRepository.findByIdOrNotFoundFail(userId);

    if (!this.isUserOwnUpdatedComment(comment, user)) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'user is not owner of comment',
      });
    }

    comment.update(updateCommentDto);

    await this.commentsRepository.save(comment);
  }

  private isUserOwnUpdatedComment(comment: CommentDocument, user: User) {
    return comment.commentatorInfo.userId === user.id;
  }
}
