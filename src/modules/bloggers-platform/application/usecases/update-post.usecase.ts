import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePostDto } from '../../dto/post.dto';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { UpdatePostDomainDto } from '../../domain/dto/post-domain.dto';
import { Post } from '../../domain/post.entity';

export class UpdatePostCommand {
  constructor(
    public postId: number,
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

    const updatedPost = this.updatePost(post, {
      ...updatePostDto,
      blogName: blog.name,
    });

    await this.postRepository.save(updatedPost);
  }

  private updatePost(prevPost: Post, dto: UpdatePostDomainDto): Post {
    return {
      ...prevPost,
      ...dto,
    };
  }
}
