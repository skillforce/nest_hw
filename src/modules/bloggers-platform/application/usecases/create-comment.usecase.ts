import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { CreateCommentDto } from '../../domain/dto/comment-domain.dto';
import { Comment, CommentModelType } from '../../domain/comment.entity';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import { CommentatorInfo } from '../../domain/schemas/commentator-info.schema';
import { CommentsRepository } from '../../infrastructure/comments.repository';

export class CreateCommentCommand {
  constructor(
    public createCommentDto: CreateCommentDto,
    public postId: string,
    public userId: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand, string>
{
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private userRepository: UsersRepository,
    private commentsRepository: CommentsRepository,
  ) {}

  async execute({
    postId,
    createCommentDto,
    userId,
  }: CreateCommentCommand): Promise<string> {
    const commentator =
      await this.userRepository.findByIdOrNotFoundFail(userId);
    const commentatorInfo: CommentatorInfo = {
      userId: commentator.id,
      userLogin: commentator.login,
    };

    const comment = this.CommentModel.createInstance({
      ...createCommentDto,
      commentatorInfo,
      postId,
    });

    await this.commentsRepository.save(comment);

    return comment._id.toString();
  }
}
