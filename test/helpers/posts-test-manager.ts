import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';
import {
  CreatePostInputDto,
  UpdatePostInputDto,
} from '../../src/modules/bloggers-platform/api/input-dto/post-input-dto/post.input-dto';
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view-dto';
import { PostsViewDto } from '../../src/modules/bloggers-platform/api/view-dto/posts.view-dto';
import { LikeStatusEnum } from '../../src/modules/bloggers-platform/domain/dto/like-domain.dto';

export class PostsTestManager {
  constructor(private app: INestApplication) {}

  async createPost(
    createModel: CreatePostInputDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<PostsViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/posts`)
      .auth('admin', `qwerty`)
      .send(createModel)
      .expect(statusCode);

    return response.body;
  }

  async getPosts(
    accessToken?: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    const req = request(this.app.getHttpServer()).get(
      `/${GLOBAL_PREFIX}/posts`,
    );

    if (accessToken) {
      req.set('Authorization', `Bearer ${accessToken}`);
    }

    const response = await req.expect(statusCode);
    return response.body;
  }

  async getPostById(
    postId: string,
    statusCode: number = HttpStatus.OK,
    accessToken?: string,
  ): Promise<PostsViewDto> {
    const req = request(this.app.getHttpServer()).get(
      `/${GLOBAL_PREFIX}/posts/${postId}`,
    );

    if (accessToken) {
      req.set('Authorization', `Bearer ${accessToken}`);
    }

    const response = await req.expect(statusCode);
    return response.body;
  }

  async updatePost(
    postId: string,
    body: UpdatePostInputDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<any> {
    const response = await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/posts/${postId}`)
      .auth('admin', `qwerty`)
      .send(body)
      .expect(statusCode);

    return response.body;
  }

  async deletePost(
    postId: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/posts/${postId}`)
      .auth('admin', `qwerty`)
      .expect(statusCode);
  }
  async makeLike(
    postId: string,
    likeStatus: LikeStatusEnum,
    accessToken: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/posts/${postId}/like-status`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ likeStatus })
      .expect(statusCode);
  }
}
