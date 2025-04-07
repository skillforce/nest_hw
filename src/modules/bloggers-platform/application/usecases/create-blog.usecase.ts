import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBlogDto } from '../../dto/blog.dto';
import { Blog, BlogModelType } from '../../domain/blog.entity';

export class CreateBlogCommand {
  constructor(public createBlogDto: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase
  implements ICommandHandler<CreateBlogCommand, string>
{
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  async execute({ createBlogDto }: CreateBlogCommand): Promise<string> {
    const newBlog = this.BlogModel.createInstance(createBlogDto);

    await newBlog.save();

    return newBlog._id.toString();
  }
}
