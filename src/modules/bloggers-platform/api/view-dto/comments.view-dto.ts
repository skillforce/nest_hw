import { CommentatorInfo } from '../../domain/schemas/commentator-info.schema';
import { CommentDocument } from '../../domain/comment.entity';
import {
  LikesInfo,
  LikeStatusEnum,
} from '../../domain/schemas/like-info.schema';

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: Date;
  likesInfo: LikesInfo;

  static mapToViewDto(comment: CommentDocument): CommentViewDto {
    const dto = new CommentViewDto();

    dto.id = comment._id.toString();
    dto.content = comment.content;
    dto.commentatorInfo = comment.commentatorInfo;
    dto.createdAt = comment.createdAt ?? new Date();
    dto.likesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatusEnum.None,
    };

    return dto;
  }
}
