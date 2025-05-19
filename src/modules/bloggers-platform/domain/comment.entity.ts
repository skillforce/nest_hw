export const CommentContentConstraints = {
  minLength: 20,
  maxLength: 300,
};

export class Comment {
  id: number;
  content: string;
  postId: number;
  creatorId: string;
  deletedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  //
  // static createInstance(postDTO: CommentDomainDto): CommentDocument {
  //   const comment = new this() as CommentDocument;
  //
  //   comment.content = postDTO.content;
  //   comment.commentatorInfo = postDTO.commentatorInfo;
  //   comment.postId = postDTO.postId;
  //
  //   return comment;
  // }
  //
  // makeDeleted() {
  //   if (this.deletedAt !== null) {
  //     throw new Error('Comment already deleted');
  //   }
  //   this.deletedAt = new Date();
  // }
  // update(updateCommentDto: UpdateCommentDto) {
  //   this.content = updateCommentDto.content;
  // }
}
