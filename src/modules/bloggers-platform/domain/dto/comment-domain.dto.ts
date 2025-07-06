export class CommentDomainDto {
  content: string;
  creatorId: number;
  createdAt?: string;
  postId: number;
}

export class CreateCommentDto {
  content: string;
}
export class UpdateCommentDto {
  content: string;
}
