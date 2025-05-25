import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { Post } from '../../domain/post.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export class DeletePostCommand {
  constructor(public id: number) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase
  implements ICommandHandler<DeletePostCommand, void>
{
  constructor(private postsRepository: PostsRepository) {}

  async execute({ id }: DeletePostCommand): Promise<void> {
    if (isNaN(id)) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'post',
            message: 'post not found',
          },
        ],
        message: 'post not found',
      });
    }

    const post = await this.postsRepository.findOrNotFoundFail(id);

    const deletedPost = this.makeDeleted(post);

    await this.postsRepository.save(deletedPost);
  }

  private makeDeleted(postToDelete: Post): Post {
    return {
      ...postToDelete,
      deletedAt: new Date(),
    };
  }
}
