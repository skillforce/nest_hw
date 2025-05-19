import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostDto } from '../../dto/post.dto';
import { Post } from '../../domain/post.entity';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { CreatePostDomainDto } from '../../domain/dto/post-domain.dto';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class CreatePostCommand {
  constructor(public createPostDto: Omit<PostDto, 'blogName'>) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase
  implements ICommandHandler<CreatePostCommand, number>
{
  constructor(
    private postRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async execute({ createPostDto }: CreatePostCommand): Promise<number> {
    const blog = await this.blogsRepository.findOrNotFoundFail(
      createPostDto.blogId,
    );
    const newPost = this.createInstance({
      ...createPostDto,
      blogName: blog.name,
    });

    return await this.postRepository.save(newPost);
  }

  private createInstance(postDTO: CreatePostDomainDto): Post {
    const post = new Post();

    post.title = postDTO.title;
    post.shortDescription = postDTO.shortDescription;
    post.content = postDTO.content;
    post.blogId = postDTO.blogId;

    return post;
  }
}
