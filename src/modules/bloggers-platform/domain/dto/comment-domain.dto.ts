export class CommentDomainDto {
  content: string;
  creatorId: string;
  createdAt?: string;
  postId: number;
}

export class CreateCommentDto {
  content: string;
}
export class UpdateCommentDto {
  content: string;
}
