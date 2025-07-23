import { Post } from '../../domain/post.entity';
import { ExtendedLikesInfoViewDto } from './like-view-dto/extended-like-info.view-dto';
import { LikesInfoViewDto } from './like-view-dto/like-info.view-dto';
import { NewestLikeViewDto } from './like-view-dto/newest-like.view-dto';

export class PostsViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfoViewDto;

  static mapToViewDto(
    post: Post & { blogName: string },
  ): Omit<PostsViewDto, 'extendedLikesInfo'> {
    const dto = new PostsViewDto();
    dto.id = post.id.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId.toString();
    dto.blogName = post.blog?.name || '';
    dto.createdAt = post.createdAt ?? new Date();

    return dto;
  }
  static mapPostsToViewWithLikesInfo(
    posts: Omit<PostsViewDto, 'extendedLikesInfo'>[],
    likesInfo: Record<string, LikesInfoViewDto>,
    newestLikes: Record<string, NewestLikeViewDto[]>,
  ): PostsViewDto[] {
    return posts.map((post) => {
      const likesInfoForPost = likesInfo[post.id];
      const newestLikesForPost = newestLikes[post.id];

      return this.mapToViewWithLikesInfo(
        post,
        likesInfoForPost,
        newestLikesForPost,
      );
    });
  }
  static mapToViewWithLikesInfo(
    post: Omit<PostsViewDto, 'extendedLikesInfo'>,
    likesInfo: LikesInfoViewDto,
    newestLikes: NewestLikeViewDto[],
  ): PostsViewDto {
    return {
      ...post,
      extendedLikesInfo: {
        likesCount: likesInfo.likesCount,
        dislikesCount: likesInfo.dislikesCount,
        myStatus: likesInfo.myStatus,
        newestLikes: newestLikes,
      },
    };
  }
}
