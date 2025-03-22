import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { BlogDomainDto, UpdateBlogDomainDto } from './dto/blog-domain.dto';

@Schema({ timestamps: true })
export class Blog {
  @Prop({ required: true, type: String, max: 15, unique: true })
  name: string;

  @Prop({ required: true, type: String, max: 500 })
  description: string;

  @Prop({ type: Boolean, default: false })
  isMembership: boolean;

  @Prop({
    required: true,
    type: String,
    max: 100,
    match:
      /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  })
  websiteUrl: string;

  @Prop({ type: Date, nullable: true })
  deletedAt: Date | null;

  createdAt?: Date;
  updatedAt?: Date;

  get id() {
    //@ts-ignore
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
