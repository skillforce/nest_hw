import { BlogDocument } from '../../domain/blog.entity';
import { PostDocument } from '../../domain/post.entity';
import { ExtendedLikesInfoViewDto } from './like-view-dto/extended-like-info.view-dto';
import { LikeStatusEnum } from '../../domain/schemas/like-info.schema';

export class PostsViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfoViewDto;

  static mapToViewDto(post: PostDocument): PostsViewDto {
    const dto = new PostsViewDto();

    dto.id = post._id.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt ?? new Date();
    dto.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatusEnum.None,
      newestLikes: [],
    };

    return dto;
  }
}
