import { Injectable } from '@nestjs/common';
import { Like } from '../../domain/like.entity';
import { LikeStatusEnum } from '../../domain/dto/like-domain.dto';
import { LikesInfoViewDto } from '../../api/view-dto/like-view-dto/like-info.view-dto';
import { NewestLikeViewDto } from '../../api/view-dto/like-view-dto/newest-like.view-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface AggregatedNewestLike {
  userId: string;
  createdAt: Date;
}

export interface AggregatedNewestLikesData {
  _id: string;
  likes: AggregatedNewestLike[];
}

@Injectable()
export class LikesQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getEntityLikesCount(parentId: string): Promise<number> {
    const query =
      'SELECT COUNT(*) AS total FROM "Likes" WHERE "parentId" = $1 AND "likeStatus" = $2';

    const result = await this.dataSource.query<{ total: number }[]>(query, [
      parentId,
      LikeStatusEnum.LIKE,
    ]);
    if (!result[0].total) return 0;
    return result[0]?.total;
  }
  async getEntityDislikesCount(parentId: string): Promise<number> {
    const query =
      'SELECT COUNT(*) AS total FROM "Likes" WHERE "parentId" = $1 AND "likeStatus" = $2';

    const result = await this.dataSource.query<{ total: number }[]>(query, [
      parentId,
      LikeStatusEnum.DISLIKE,
    ]);
    if (!result[0].total) return 0;
    return result[0]?.total;
  }
  async getUserLikeStatusForEntity(
    parentId: string,
    userId?: string,
  ): Promise<LikeStatusEnum> {
    if (!userId) return LikeStatusEnum.NONE;
    const query =
      'SELECT * FROM "Likes" WHERE "parentId" = $1 AND "userId" = $2';
    const result = await this.dataSource.query<Like[]>(query, [
      parentId,
      userId,
    ]);
    return result[0].likeStatus;
  }

  async getNewestLikesForEntity(
    parentId: number,
  ): Promise<NewestLikeViewDto[]> {
    const likeQuery = `SELECT
  l."createdAt" AS "addedAt", l."userId", u."login" 
   FROM "Likes" l 
   LEFT JOIN "Users" u 
   ON l."userId" = u."id"
   WHERE l."parentId" = $1 AND l."likeStatus" = $2 AND l."deletedAt" IS NULL
   ORDER BY l."createdAt" DESC 
   LIMIT 3`;

    return await this.dataSource.query<
      { addedAt: Date; userId: string; login: string }[]
    >(likeQuery, [parentId, LikeStatusEnum.LIKE]);
  }

  async getEntityLikesInfo(
    parentId: number,
    userId?: number,
  ): Promise<LikesInfoViewDto> {
    const query = `SELECT 
      COUNT(*) FILTER (WHERE "likeStatus" = $1) AS "likesCount",
      COUNT(*) FILTER (WHERE "likeStatus" = $2) AS "dislikesCount",
      COALESCE(MAX(CASE WHEN "userId" = $3 THEN "likeStatus" END), $4) AS "myStatus"
      FROM "Likes" WHERE "parentId" = $5;`;

    const result = await this.dataSource.query<LikesInfoViewDto[]>(query, [
      LikeStatusEnum.LIKE,
      LikeStatusEnum.DISLIKE,
      userId ?? null,
      LikeStatusEnum.NONE,
      parentId,
    ]);

    const { likesCount, dislikesCount, myStatus: likeStatus } = result[0];
    return {
      likesCount: Number(likesCount),
      dislikesCount: Number(dislikesCount),
      myStatus: likeStatus,
    };
  }

  async getBulkLikesInfo({
    parentIds,
    userId,
  }: {
    parentIds: number[];
    userId?: number;
  }): Promise<Record<string, LikesInfoViewDto>> {
    const likesQuery = `SELECT 
       l."likeStatus", l."userId", l."parentId"
       FROM "Likes" l
       LEFT JOIN "Users" u ON l."userId" = u."id"
       WHERE l."parentId" = ANY($1::varchar[]) AND l."deletedAt" IS NULL`;

    const likesUsersResult = await this.dataSource.query<
      { likeStatus: LikeStatusEnum; userId: number; parentId: number }[]
    >(likesQuery, [parentIds]);

    const result: Record<string, LikesInfoViewDto> = {};

    parentIds.forEach((entityId) => {
      const userLikeForEntity = likesUsersResult.find(
        (like) => like.parentId === entityId && like.userId === userId,
      );
      result[entityId] = {
        likesCount: likesUsersResult.filter(
          (like) =>
            like.parentId === entityId &&
            like.likeStatus === LikeStatusEnum.LIKE,
        ).length,
        dislikesCount: likesUsersResult.filter(
          (like) =>
            like.parentId === entityId &&
            like.likeStatus === LikeStatusEnum.DISLIKE,
        ).length,
        myStatus: userLikeForEntity
          ? userLikeForEntity.likeStatus
          : LikeStatusEnum.NONE,
      };
    });

    return result;
  }

  async getBulkNewestLikesInfo(
    parentIds: number[],
  ): Promise<Record<string, NewestLikeViewDto[]>> {
    const likesUsersQuery = `WITH ranked_likes AS 
      ( SELECT * ,
       ROW_NUMBER() OVER (PARTITION BY l."parentId" ORDER BY l."createdAt" DESC) as rl
       FROM "Likes" l
       WHERE "parentId" = ANY(ARRAY [$1::varchar[]]) AND "likeStatus" = $2 )
       SELECT rl."parentId", u."id" as "userId", u."login", rl."createdAt" AS "addedAt"
       FROM ranked_likes rl LEFT JOIN  "Users" u ON rl."userId" = u."id"
       WHERE rl <= 3;`;

    const likesUsersResult = await this.dataSource.query<
      { parentId: number; userId: string; login: string; addedAt: Date }[]
    >(likesUsersQuery, [parentIds, LikeStatusEnum.LIKE]);
    return parentIds.reduce(
      (acc, parentId) => ({
        ...acc,
        [parentId]: likesUsersResult
          .filter((like) => like.parentId === parentId)
          .map((like) => ({
            addedAt: like.addedAt,
            userId: like.userId,
            login: like.login,
          })),
      }),
      {},
    );
  }
}
