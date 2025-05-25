import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { Post } from '../../domain/post.entity';

export class DeletePostCommand {
  constructor(public id: number) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase
  implements ICommandHandler<DeletePostCommand, void>
{
  constructor(private postsRepository: PostsRepository) {}

  async execute({ id }: DeletePostCommand): Promise<void> {
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
