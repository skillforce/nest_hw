import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import {
  CommentatorInfo,
  CommentatorInfoSchema,
} from './schemas/commentator-info.schema';
import { CommentDomainDto, UpdateCommentDto } from './dto/comment-domain.dto';

export const CommentContentConstraints = {
  minLength: 20,
  maxLength: 300,
};

@Schema({ timestamps: true })
export class Comment {
  @Prop({
    required: true,
    type: String,
    min: CommentContentConstraints.minLength,
    max: CommentContentConstraints.maxLength,
  })
  content: string;

  @Prop({ required: true, type: String })
  postId: string;

  @Prop({ type: CommentatorInfoSchema })
  commentatorInfo: CommentatorInfo;

  @Prop({ type: Date, nullable: true, default: null })
  deletedAt: Date | null;

  createdAt?: Date;
  updatedAt?: Date;

  get id() {
    //@ts-ignore
    //eslint-disable-next-line
    return this._id.toString();
  }

  static createInstance(postDTO: CommentDomainDto): CommentDocument {
    const comment = new this() as CommentDocument;

    comment.content = postDTO.content;
    comment.commentatorInfo = postDTO.commentatorInfo;
    comment.postId = postDTO.postId;

    return comment;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Comment already deleted');
    }
    this.deletedAt = new Date();
  }
  update(updateCommentDto: UpdateCommentDto) {
    this.content = updateCommentDto.content;
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.loadClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;

export type CommentModelType = Model<CommentDocument> & typeof Comment;
