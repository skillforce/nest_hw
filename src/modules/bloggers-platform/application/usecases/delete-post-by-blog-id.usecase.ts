import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { Post } from '../../domain/post.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export class DeletePostByBlogIdCommand {
  constructor(
    public postId: number,
    public blogId: number,
  ) {}
}

@CommandHandler(DeletePostByBlogIdCommand)
export class DeletePostByBlogIdUseCase
  implements ICommandHandler<DeletePostByBlogIdCommand, void>
{
  constructor(private postsRepository: PostsRepository) {}

  async execute({ postId, blogId }: DeletePostByBlogIdCommand): Promise<void> {
    const post = await this.postsRepository.findOrNotFoundFail(postId);

    if (post.blogId !== blogId) {
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
