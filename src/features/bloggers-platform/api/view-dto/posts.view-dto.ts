import { BlogDocument } from '../../domain/blog.entity';
import { PostDocument } from '../../domain/post.entity';

export class PostsViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  // extendedLikesInfo: ExtendedLikesInfoViewModel;

  static mapToViewDto(post: PostDocument): PostsViewDto {
    const dto = new PostsViewDto();

    dto.id = post._id.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt ?? new Date();

    return dto;
  }
}
