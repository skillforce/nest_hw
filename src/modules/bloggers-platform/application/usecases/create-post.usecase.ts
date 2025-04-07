import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostDto } from '../../dto/createPostDto';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../domain/post.entity';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class CreatePostCommand {
  constructor(public createPostDto: Omit<CreatePostDto, 'blogName'>) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase
  implements ICommandHandler<CreatePostCommand, string>
{
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private blogsRepository: BlogsRepository,
  ) {}

  async execute({ createPostDto }: CreatePostCommand): Promise<string> {
    const blog = await this.blogsRepository.findOrNotFoundFail(
      createPostDto.blogId,
    );
    const newPost = this.PostModel.createInstance({
      ...createPostDto,
      blogName: blog.name,
    });

    await newPost.save();

    return newPost._id.toString();
  }
}
