import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Comment } from '../domain/comment.entity';
import { Like } from '../domain/like.entity';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findById(id: number): Promise<Comment | null> {
    const query =
      'SELECT * FROM "Comments" WHERE "id" = $1 AND "deletedAt" IS NULL';

    const result = await this.dataSource.query<Comment[]>(query, [id]);
    return result[0] ?? null;
  }
  async findOrNotFoundFail(id: number): Promise<Comment> {
    const comment = await this.findById(id);

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'comment',
            message: 'comment not found',
          },
        ],
        message: 'comment not found',
      });
    }

    return comment;
  }

  async save(comment: Comment) {
    let query: string;
    let values: any[];

    const hasId = !!comment.id;
    if (hasId) {
      query = `
      INSERT INTO "Comments" ("id", "content", "creatorId", "postId", "deletedAt")
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT ("id") DO UPDATE SET
        "content" = EXCLUDED."content",
        "deletedAt" = EXCLUDED."deletedAt"
        RETURNING "id";
    `;
      values = [
        comment.id,
        comment.content,
        comment.creatorId,
        comment.postId,
        comment.deletedAt ?? null,
      ];
    } else {
      query = `
        INSERT INTO "Comments" ("content", "creatorId", "postId", "deletedAt")
      VALUES ($1, $2, $3, $4)
      RETURNING "id";
    `;
      values = [
        comment.content,
        comment.creatorId,
        comment.postId,
        comment.deletedAt ?? null,
      ];
    }

    const result = await this.dataSource.query<Like[]>(query, values);

    return +result[0].id;
  }
}
