import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, BlogModelType } from '../domain/blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name) private readonly BlogModel: BlogModelType,
  ) {}

  async findById(id: string) {
    return this.BlogModel.findById({ _id: id, deletedAt: null });
  }
  async findOrNotFoundFail(id: string): Promise<BlogDocument> {
    const blog = await this.findById(id);

    if (!blog) {
      throw new NotFoundException('blog not found');
    }

    return blog;
  }

  async save(blog: BlogDocument) {
    return blog.save();
  }
}
