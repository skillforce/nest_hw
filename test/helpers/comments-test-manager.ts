import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';
import {
  CreateCommentInputDto,
  UpdateCommentInputDto,
} from '../../src/modules/bloggers-platform/api/input-dto/comment-input-dto/comment.input-dto';
import { LikeStatusEnum } from '../../src/modules/bloggers-platform/domain/dto/like-domain.dto';
import { CommentViewDto } from '../../src/modules/bloggers-platform/api/view-dto/comments.view-dto';

export class CommentsTestManager {
  constructor(private app: INestApplication) {}
  async createComment(
    postId: string,
    body: CreateCommentInputDto,
    accessToken: string,
  ): Promise<CommentViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/posts/${postId}/comments`)
      .send(body)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.CREATED);

    return response.body;
  }

  async getCommentById(
    commentId: string,
    accessToken?: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<CommentViewDto> {
    const req = request(this.app.getHttpServer()).get(
      `/${GLOBAL_PREFIX}/comments/${commentId}`,
    );

    if (accessToken) {
      req.set('Authorization', `Bearer ${accessToken}`);
    }

    const response = await req.expect(statusCode);
    return response.body;
  }

  async getCommentsByPostId(
    postId: string,
    accessToken?: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<CommentViewDto> {
    const req = request(this.app.getHttpServer()).get(
      `/${GLOBAL_PREFIX}/posts/${postId}/comments`,
    );

    if (accessToken) {
      req.set('Authorization', `Bearer ${accessToken}`);
    }

    const response = await req.expect(statusCode);
    return response.body;
  }

  async updateComment(
    commentId: string,
    body: UpdateCommentInputDto,
    accessToken: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/comments/${commentId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(body)
      .expect(statusCode);
  }

  async likeComment(
    commentId: string,
    likeStatus: LikeStatusEnum,
    accessToken: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/comments/${commentId}/like-status`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ likeStatus })
      .expect(statusCode);
  }

  async deleteComment(
    commentId: string,
    accessToken: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/comments/${commentId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(statusCode);
  }
}
