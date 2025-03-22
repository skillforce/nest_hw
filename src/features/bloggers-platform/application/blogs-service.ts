import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../domain/blog.entity';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { CreateBlogDto, UpdateBlogDto } from '../dto/blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private readonly BlogModel: BlogModelType,
    private readonly blogRepository: BlogsRepository,
  ) {}

  async createBlog(createBlogDto: CreateBlogDto): Promise<string> {
    const newBlog = this.BlogModel.createInstance(createBlogDto);

    return newBlog._id.toString();
  }

  async updateBlogById(
    id: string,
    updateBlogDto: UpdateBlogDto,
  ): Promise<string> {
    const blog = await this.blogRepository.findOrNotFoundFail(id);

    blog.update(updateBlogDto);

    const updatedBlog = await this.blogRepository.save(blog);

    return updatedBlog._id.toString();
  }
  async deleteBlogById(id: string) {
    const blog = await this.blogRepository.findOrNotFoundFail(id);

    blog.makeDeleted();

    await this.blogRepository.save(blog);
  }
}
