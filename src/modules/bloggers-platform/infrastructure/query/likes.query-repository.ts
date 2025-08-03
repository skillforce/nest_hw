import { Injectable } from '@nestjs/common';
import { Like } from '../../domain/like.entity';
import { LikeStatusEnum } from '../../domain/dto/like-domain.dto';
import { LikesInfoViewDto } from '../../api/view-dto/like-view-dto/like-info.view-dto';
import { NewestLikeViewDto } from '../../api/view-dto/like-view-dto/newest-like.view-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class LikesQueryRepository {
  constructor(
    @InjectRepository(Like) private likeOrmRepository: Repository<Like>,
  ) {}

  async getEntityLikesCount(parentId: number): Promise<number> {
    return await this.likeOrmRepository.count({
      where: {
        parentId,
        likeStatus: LikeStatusEnum.LIKE,
      },
    });
  }
  async getEntityDislikesCount(parentId: number): Promise<number> {
    return await this.likeOrmRepository.count({
      where: {
        parentId,
        likeStatus: LikeStatusEnum.DISLIKE,
      },
    });
  }
  async getUserLikeStatusForEntity(
    parentId: number,
    userId?: number,
  ): Promise<LikeStatusEnum> {
    if (!userId) return LikeStatusEnum.NONE;
    const result = await this.likeOrmRepository.findOne({
      where: {
        parentId,
        userId,
        deletedAt: IsNull(),
      },
    });
    return result ? result.likeStatus : LikeStatusEnum.NONE;
  }

  async getNewestLikesForEntity(
    parentId: number,
  ): Promise<NewestLikeViewDto[]> {
    const result = await this.likeOrmRepository
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.user', 'u')
      .select([
        'l.createdAt AS "addedAt"',
        'l.userId AS "userId"',
        'u.login as "login"',
      ])
      .where('l.parentId = :parentId', { parentId })
      .andWhere('l.likeStatus = :likeStatus', {
        likeStatus: LikeStatusEnum.LIKE,
      })
      .andWhere('l.deletedAt IS NULL')
      .orderBy('l.createdAt', 'DESC')
      .limit(3)
      .getRawMany<{ userId: number; login: string; addedAt: Date }>();

    return result.map(NewestLikeViewDto.mapToViewDto);
  }

  async getEntityLikesInfo(
    parentId: number,
    userId?: number,
  ): Promise<LikesInfoViewDto> {
    const result = await this.likeOrmRepository
      .createQueryBuilder('l')
      .select([
        `COUNT(*) FILTER (WHERE l."likeStatus" = :like) AS "likesCount"`,
        `COUNT(*) FILTER (WHERE l."likeStatus" = :dislike) AS "dislikesCount"`,
        `COALESCE(MAX(CASE WHEN l."userId" = :userId THEN l."likeStatus" END), :defaultStatus) AS "myStatus"`,
      ])
      .where('l."parentId" = :parentId', { parentId })
      .andWhere('l.deletedAt IS NULL')
      .setParameters({
        like: LikeStatusEnum.LIKE,
        dislike: LikeStatusEnum.DISLIKE,
        userId,
        defaultStatus: LikeStatusEnum.NONE,
      })
      .getRawOne();

    return {
      likesCount: Number(result.likesCount),
      dislikesCount: Number(result.dislikesCount),
      myStatus: result.myStatus as LikeStatusEnum,
    };
  }

  async getBulkLikesInfo({
    parentIds,
    userId,
  }: {
    parentIds: number[];
    userId?: number;
  }): Promise<Record<string, LikesInfoViewDto>> {
    console.log(parentIds);
    console.log(userId);
    const results = await this.likeOrmRepository
      .createQueryBuilder('l')
      .select('l.parentId', 'parentId')
      .addSelect(`COUNT(*) FILTER (WHERE l."likeStatus" = :like)`, 'likesCount')
      .addSelect(
        `COUNT(*) FILTER (WHERE l."likeStatus" = :dislike)`,
        'dislikesCount',
      )
      .addSelect(
        `COALESCE(MAX(CASE WHEN l."userId" = :userId THEN l."likeStatus" END), :none)`,
        'myStatus',
      )
      .where('l.parentId IN (:...parentIds)', {
        parentIds: parentIds.length ? parentIds : [],
      })
      .andWhere('l.deletedAt IS NULL')
      .setParameters({
        like: LikeStatusEnum.LIKE,
        dislike: LikeStatusEnum.DISLIKE,
        userId,
        none: LikeStatusEnum.NONE,
      })
      .groupBy('l.parentId')
      .getRawMany();
    const result: Record<string, LikesInfoViewDto> = {};

    for (const parentId of parentIds) {
      const row = results.find((r) => r.parentId === parentId);
      result[parentId] = {
        likesCount: row ? Number(row.likesCount) : 0,
        dislikesCount: row ? Number(row.dislikesCount) : 0,
        myStatus: row ? (row.myStatus as LikeStatusEnum) : LikeStatusEnum.NONE,
      };
    }

    return result;
  }

  async getBulkNewestLikesInfo(
    parentIds: number[],
  ): Promise<Record<string, NewestLikeViewDto[]>> {
    const qb = this.likeOrmRepository
      .createQueryBuilder('l')
      .leftJoin('l.user', 'u')
      .addSelect('u.id', 'userId')
      .addSelect('u.login', 'login')
      .addSelect('l.createdAt', 'addedAt')
      .addSelect('l.parentId', 'parentId')
      .addSelect(
        `ROW_NUMBER() OVER (PARTITION BY l."parentId" ORDER BY l."createdAt" DESC)`,
        'rn',
      )
      .where('l.parentId IN (:...parentIds)', { parentIds })
      .andWhere('l.likeStatus = :likeStatus', {
        likeStatus: LikeStatusEnum.LIKE,
      })
      .andWhere('l.deletedAt IS NULL');

    const rawLikes = await qb.getRawMany<{
      userId: number;
      login: string;
      addedAt: Date;
      parentId: number;
      rn: string;
    }>();

    const filtered = rawLikes.filter((r) => Number(r.rn) <= 3);

    const result: Record<string, NewestLikeViewDto[]> = {};

    for (const parentId of parentIds) {
      result[parentId] = filtered
        .filter((r) => r.parentId === parentId)
        .map(NewestLikeViewDto.mapToViewDto);
    }

    return result;
  }
}
