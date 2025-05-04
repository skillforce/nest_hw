import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { BlogDomainDto, UpdateBlogDomainDto } from './dto/blog-domain.dto';

export const blogNameConstraint = { minLength: 1, maxLength: 15 };
export const blogDescriptionConstraint = { minLength: 1, maxLength: 500 };
export const blogUrlConstraint = {
  minLength: 1,
  maxLength: 100,
  pattern:
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
};

export class Blog {
  id: number;
  name: string;
  description: string;
  isMembership: boolean;
  websiteUrl: string;
  deletedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}
