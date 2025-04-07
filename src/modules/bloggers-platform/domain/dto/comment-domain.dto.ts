import { CommentatorInfo } from '../schemas/commentator-info.schema';

export class CommentDomainDto {
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt?: string;
  postId: string;
}

export class CreateCommentDto {
  content: string;
}
export class UpdateCommentDto {
  content: string;
}
