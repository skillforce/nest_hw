import { Injectable } from '@nestjs/common';
import { Like } from '../domain/like.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class LikesRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async findByUserIdAndParentId(userId: string, parentId: string) {
    const query =
      'SELECT * FROM "Likes" WHERE "userId" = $1 AND "parentId" = $2';
    const result = await this.dataSource.query<Like[]>(query, [
      userId,
      parentId,
    ]);
    return result[0];
  }
  async save(like: Omit<Like, 'id'> & { id?: number }) {
    let query: string;
    let values: any[];

    const hasId = !!like.id;
    if (hasId) {
      query = `
      INSERT INTO "Likes" ("id", "likeStatus", "userId", "parentId", "deletedAt")
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT ("id") DO UPDATE SET
        "likeStatus" = EXCLUDED."likeStatus",
        "userId" = EXCLUDED."userId",
        "parentId" = EXCLUDED."parentId",
        "deletedAt" = EXCLUDED."deletedAt"
        RETURNING "id";
    `;
      values = [
        like.id,
        like.likeStatus,
        like.userId,
        like.parentId,
        like.deletedAt ?? null,
      ];
    } else {
      query = `
        INSERT INTO "Likes" ("id", "likeStatus", "userId", "parentId", "deletedAt")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING "id";
    `;
      values = [
        like.id,
        like.likeStatus,
        like.userId,
        like.parentId,
        like.deletedAt ?? null,
      ];
    }

    const result = await this.dataSource.query<Like[]>(query, values);

    return +result[0].id;
  }
}
