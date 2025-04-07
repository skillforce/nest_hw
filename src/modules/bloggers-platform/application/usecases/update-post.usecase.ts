import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePostDto } from '../../dto/createPostDto';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class UpdatePostCommand {
  constructor(
    public postId: string,
    public updatePostDto: Omit<UpdatePostDto, 'blogName'>,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase
  implements ICommandHandler<UpdatePostCommand, void>
{
  constructor(
    private postRepository: PostsRepository,
    private blogRepository: BlogsRepository,
  ) {}

  async execute({ postId, updatePostDto }: UpdatePostCommand): Promise<void> {
    const blog = await this.blogRepository.findOrNotFoundFail(
      updatePostDto.blogId,
    );
    const post = await this.postRepository.findOrNotFoundFail(postId);

    post.update({ ...updatePostDto, blogName: blog.name });

    await this.postRepository.save(post);
  }
}
