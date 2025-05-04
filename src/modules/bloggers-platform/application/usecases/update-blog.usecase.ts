import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBlogDto } from '../../dto/blog.dto';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { Blog } from '../../domain/blog.entity';
import { UpdateBlogDomainDto } from '../../domain/dto/blog-domain.dto';

export class UpdateBlogCommand {
  constructor(
    public id: string,
    public updateBlogDto: UpdateBlogDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase
  implements ICommandHandler<UpdateBlogCommand, void>
{
  constructor(private blogsRepository: BlogsRepository) {}

  async execute({ updateBlogDto, id }: UpdateBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findOrNotFoundFail(id);

    const newBlog = this.updateBlog(blog, updateBlogDto);

    await this.blogsRepository.save(newBlog);
  }

  private updateBlog(prevBlog: Blog, dto: UpdateBlogDomainDto): Blog {
    return {
      ...prevBlog,
      ...dto,
    };
  }
}
