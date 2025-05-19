import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  CommentDomainDto,
  CreateCommentDto,
} from '../../domain/dto/comment-domain.dto';
import { Comment } from '../../domain/comment.entity';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';

export class CreateCommentCommand {
  constructor(
    public createCommentDto: CreateCommentDto,
    public postId: number,
    public userId: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand, string>
{
  constructor(
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

    const comment = this.createInstance({
      ...createCommentDto,
      creatorId: commentator.id,
      postId,
    });

    const createdCommentId = await this.commentsRepository.save(comment);

    return createdCommentId.toString();
  }

  private createInstance(commentDto: CommentDomainDto): Comment {
    const comment = new Comment();

    comment.content = commentDto.content;
    comment.creatorId = commentDto.creatorId;
    comment.postId = commentDto.postId;

    return comment;
  }
}
