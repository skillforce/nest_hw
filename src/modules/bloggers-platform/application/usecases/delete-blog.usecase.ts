import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { Blog } from '../../domain/blog.entity';

export class DeleteBlogCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase
  implements ICommandHandler<DeleteBlogCommand, void>
{
  constructor(private blogsRepository: BlogsRepository) {}

  async execute({ id }: DeleteBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findOrNotFoundFail(id);

    const deletedBlog = this.makeDeleted(blog);

    await this.blogsRepository.save(deletedBlog);
  }

  private makeDeleted(blogToDelete: Blog): Blog {
    return {
      ...blogToDelete,
      deletedAt: new Date(),
    };
  }
}
