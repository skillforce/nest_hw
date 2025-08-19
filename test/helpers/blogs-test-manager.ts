import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';
import { UserViewDto } from '../../src/modules/user-accounts/api/view-dto/users-view-dto/users.view-dto';
import {
  CreateBlogInputDto,
  UpdateBlogInputDto,
} from '../../src/modules/bloggers-platform/api/input-dto/blog-input-dto/blog.input-dto';
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view-dto';
import { BlogsViewDto } from '../../src/modules/bloggers-platform/api/view-dto/blogs.view-dto';

export class BlogsTestManager {
  constructor(private app: INestApplication) {}

  async createBlog(
    createModel: CreateBlogInputDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<BlogsViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/sa/blogs`)
      .auth('admin', 'qwerty')
      .send(createModel)
      .expect(statusCode);

    return response.body;
  }

  async getBlogs(
    statusCode: number = HttpStatus.OK,
  ): Promise<PaginatedViewDto<BlogsViewDto[]>> {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/blogs`)
      .expect(statusCode);

    return response.body;
  }

  async getBlogById(
    id: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<BlogsViewDto> {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/blogs/${id}`)
      .expect(statusCode);

    return response.body;
  }

  async updateBlog(
    body: UpdateBlogInputDto,
    blogId: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<any> {
    const response = await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/sa/blogs/${blogId}`)
      .auth('admin', 'qwerty')
      .send(body)
      .expect(statusCode);
    return response.body;
  }

  async deleteBlog(
    blogId: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/sa/blogs/${blogId}`)
      .auth('admin', 'qwerty')
      .expect(statusCode);
  }
}
