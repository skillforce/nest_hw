import { CommentatorInfo } from '../../domain/schemas/commentator-info.schema';
import { CommentDocument } from '../../domain/comment.entity';
import { LikesInfoViewDto } from './like-view-dto/like-info.view-dto';

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: Date;
  likesInfo: LikesInfoViewDto;

  static mapToViewDto(
    comment: CommentDocument,
  ): Omit<CommentViewDto, 'likesInfo'> {
    const dto = new CommentViewDto();

    dto.id = comment._id.toString();
    dto.content = comment.content;
    dto.commentatorInfo = comment.commentatorInfo;
    dto.createdAt = comment.createdAt ?? new Date();

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
