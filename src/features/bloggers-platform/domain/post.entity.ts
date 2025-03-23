import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument, Model } from 'mongoose';
import {
  CreatePostDomainDto,
  UpdatePostDomainDto,
} from './dto/post-domain.dto';
import {
  ExtendedLikesInfo,
  ExtendedLikesInfoSchema,
} from './schemas/extended-like-info.schema';

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true, type: String, max: 30 })
  title: string;

  @Prop({ required: true, type: String, max: 100 })
  shortDescription: string;

  @Prop({ required: true, type: String, max: 1000 })
  content: string;

  @Prop({ required: true, type: String })
  blogId: string;

  @Prop({ required: true, type: String })
  blogName: string;

  @Prop({
    type: ExtendedLikesInfoSchema,
    required: true,
    default: {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: [],
    },
  })
  extendedLikesInfo: ExtendedLikesInfo;

  @Prop({ type: Date, nullable: true, default: null })
  deletedAt: Date | null;

  createdAt?: Date;
  updatedAt?: Date;

  get id() {
    //@ts-ignore
    return this._id.toString();
  }

  static createInstance(postDTO: CreatePostDomainDto): PostDocument {
    const post = new this() as PostDocument;

    post.title = postDTO.title;
    post.shortDescription = postDTO.shortDescription;
    post.content = postDTO.content;
    post.blogId = postDTO.blogId;
    post.blogName = postDTO.blogName;

    return post;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Post already deleted');
    }
    this.deletedAt = new Date();
  }

  update(dto: UpdatePostDomainDto) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = dto.blogId;
    this.blogName = dto.blogName;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.loadClass(Post);

export type PostDocument = HydratedDocument<Post>;

export type PostModelType = Model<PostDocument> & typeof Post;
