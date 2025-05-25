import { CommentatorInfo } from '../../domain/schemas/commentator-info.schema';
import { LikesInfoViewDto } from './like-view-dto/like-info.view-dto';
import { Comment } from '../../domain/comment.entity';

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: Date;
  likesInfo: LikesInfoViewDto;

  static mapToViewDto(
    commentWithCreatorInfo: Comment & { login: string },
  ): Omit<CommentViewDto, 'likesInfo'> {
    const dto = new CommentViewDto();

    dto.id = commentWithCreatorInfo.id.toString();
    dto.content = commentWithCreatorInfo.content;
    dto.commentatorInfo = {
      userId: commentWithCreatorInfo.creatorId.toString(),
      userLogin: commentWithCreatorInfo.login,
    };
    dto.createdAt = commentWithCreatorInfo.createdAt ?? new Date();

    return dto;
  }

  static mapCommentsToViewWithLikesInfo(
    comments: Omit<CommentViewDto, 'likesInfo'>[],
    likesInfo: Record<string, LikesInfoViewDto>,
  ): CommentViewDto[] {
    return comments.map((comment) => {
      const likesInfoForComment = likesInfo[comment.id];
      return this.mapToViewWithLikesInfo(comment, likesInfoForComment);
    });
  }
  static mapToViewWithLikesInfo(
    comment: Omit<CommentViewDto, 'likesInfo'>,
    likesInfo: LikesInfoViewDto,
  ): CommentViewDto {
    return {
      ...comment,
      likesInfo,
    };
  }
}
