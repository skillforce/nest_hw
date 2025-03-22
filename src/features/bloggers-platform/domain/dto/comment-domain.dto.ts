import { CommentatorInfo } from '../commentator-info.schema';

export class CommentDomainDto {
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt?: string;
  postId: string;
}
