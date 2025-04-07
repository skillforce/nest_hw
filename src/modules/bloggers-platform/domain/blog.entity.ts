import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
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

@Schema({ timestamps: true })
export class Blog {
  @Prop({
    required: true,
    type: String,
    max: blogNameConstraint.maxLength,
    unique: true,
  })
  name: string;

  @Prop({
    required: true,
    type: String,
    min: blogDescriptionConstraint.minLength,
    max: blogDescriptionConstraint.maxLength,
  })
  description: string;

  @Prop({ type: Boolean, default: false })
  isMembership: boolean;

  @Prop({
    required: true,
    type: String,
    min: blogUrlConstraint.minLength,
    max: blogUrlConstraint.maxLength,
    match: blogUrlConstraint.pattern,
  })
  websiteUrl: string;

  @Prop({ type: Date, nullable: true, default: null })
  deletedAt: Date | null;

  createdAt?: Date;
  updatedAt?: Date;

  get id() {
    //@ts-ignore
    //eslint-disable-next-line
    return this._id.toString();
  }

  static createInstance(blogDTO: BlogDomainDto): BlogDocument {
    const blog = new this() as BlogDocument;

    blog.name = blogDTO.name;
    blog.description = blogDTO.description;
    blog.websiteUrl = blogDTO.websiteUrl;

    return blog;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Blog already deleted');
    }
    this.deletedAt = new Date();
  }

  update(dto: UpdateBlogDomainDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.loadClass(Blog);

export type BlogDocument = HydratedDocument<Blog>;

export type BlogModelType = Model<BlogDocument> & typeof Blog;
