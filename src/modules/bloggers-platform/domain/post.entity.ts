import { SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument, Model } from 'mongoose';
import {
  CreatePostDomainDto,
  UpdatePostDomainDto,
} from './dto/post-domain.dto';

export const titleConstraints = {
  minLength: 1,
  maxLength: 30,
};
export const shortDescriptionConstraints = {
  minLength: 1,
  maxLength: 100,
};
export const contentConstraints = {
  minLength: 1,
  maxLength: 1000,
};

export class Post {
  id: number;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  deletedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;

  // static createInstance(postDTO: CreatePostDomainDto): PostDocument {
  //   const post = new this() as PostDocument;
  //
  //   post.title = postDTO.title;
  //   post.shortDescription = postDTO.shortDescription;
  //   post.content = postDTO.content;
  //   post.blogId = postDTO.blogId;
  //
  //   return post;
  // }
  //
  // makeDeleted() {
  //   if (this.deletedAt !== null) {
  //     throw new Error('Post already deleted');
  //   }
  //   this.deletedAt = new Date();
  // }
  //
  // update(dto: UpdatePostDomainDto) {
  //   this.title = dto.title;
  //   this.shortDescription = dto.shortDescription;
  //   this.content = dto.content;
  //   this.blogId = dto.blogId;
  // }
}
