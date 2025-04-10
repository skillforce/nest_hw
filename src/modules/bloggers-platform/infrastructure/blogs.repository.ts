import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, BlogModelType } from '../domain/blog.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

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
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `Blog with id ${id} not found`,
      });
    }

    return blog;
  }

  async save(blog: BlogDocument) {
    return blog.save();
  }
}
