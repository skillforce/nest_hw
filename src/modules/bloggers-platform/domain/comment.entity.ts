export const CommentContentConstraints = {
  minLength: 20,
  maxLength: 300,
};

export class Comment {
  id: number;
  content: string;
  postId: number;
  creatorId: number;
  deletedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}
