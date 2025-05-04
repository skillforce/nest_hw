import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBlogDto } from '../../dto/blog.dto';
import { Blog } from '../../domain/blog.entity';
import { BlogDomainDto } from '../../domain/dto/blog-domain.dto';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class CreateBlogCommand {
  constructor(public createBlogDto: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase
  implements ICommandHandler<CreateBlogCommand, string>
{
  constructor(private blogsRepository: BlogsRepository) {}

  async execute({ createBlogDto }: CreateBlogCommand): Promise<string> {
    const newBlog = this.createInstance(createBlogDto);

    const newBlogId = await this.blogsRepository.save(newBlog);

    return newBlogId.toString();
  }

  private createInstance(blogDTO: BlogDomainDto): Blog {
    const blog = new Blog();

    blog.name = blogDTO.name;
    blog.description = blogDTO.description;
    blog.websiteUrl = blogDTO.websiteUrl;

    return blog;
  }
}
