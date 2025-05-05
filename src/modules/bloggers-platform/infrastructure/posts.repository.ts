import { Injectable } from '@nestjs/common';
import { Post } from '../domain/post.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../../user-accounts/domain/user.entity';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findById(id: number): Promise<Post | null> {
    if (!Number.isInteger(Number(id))) {
      return null;
    }
    const query =
      'SELECT * FROM "Posts" WHERE "id" = $1 AND "deletedAt" IS NULL';
    const result = await this.dataSource.query<Post[]>(query, [id]);
    return result[0] ?? null;
  }
  async findOrNotFoundFail(id: number): Promise<Post> {
    const post = await this.findById(id);

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'post',
            message: 'post not found',
          },
        ],
        message: 'post not found',
      });
    }

    return post;
  }

  async save(post: Omit<Post, 'id'> & { id?: number }): Promise<number> {
    let query: string;
    let values: any[];

    const hasId = !!post.id;
    if (hasId) {
      query = `
      INSERT INTO "Posts" ("id", "title", "shortDescription", "content", "blogId", "deletedAt")
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT ("id") DO UPDATE SET
        "title" = EXCLUDED."title",
        "shortDescription" = EXCLUDED."shortDescription",
        "content" = EXCLUDED."content",
        "blogId" = EXCLUDED."blogId",
        "deletedAt" = EXCLUDED."deletedAt"
        RETURNING "id";
    `;
      values = [
        post.id,
        post.title,
        post.shortDescription,
        post.content,
        post.blogId,
        post.deletedAt ?? null,
      ];
    } else {
      query = `
        INSERT INTO "Posts" ("title", "shortDescription", "content", "blogId", "deletedAt")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING "id";
    `;
      values = [
        post.title,
        post.shortDescription,
        post.content,
        post.blogId,
        post.deletedAt ?? null,
      ];
    }

    const result = await this.dataSource.query<User[]>(query, values);

    return +result[0].id;
  }
}
