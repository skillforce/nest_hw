import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like, LikeModelType } from '../../domain/like.entity';
import { LikeStatusEnum } from '../../domain/dto/like-domain.dto';
import { LikesInfoViewDto } from '../../api/view-dto/like-view-dto/like-info.view-dto';
import { User, UserModelType } from '../../../user-accounts/domain/user.entity';
import { NewestLikeViewDto } from '../../api/view-dto/like-view-dto/newest-like.view-dto';
import { PipelineStage } from 'mongoose';

export interface AggregatedLikeInfo {
  _id: string;
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatusEnum;
}

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
  constructor(
    @InjectModel(Like.name) private readonly LikeModel: LikeModelType,
    @InjectModel(User.name) private readonly UserModel: UserModelType,
  ) {}

  async getEntityLikesCount(parentId: string): Promise<number> {
    return this.LikeModel.countDocuments({
      parentId,
      likeStatus: LikeStatusEnum.LIKE,
    });
  }
  async getEntityDislikesCount(parentId: string): Promise<number> {
    return this.LikeModel.countDocuments({
      parentId,
      likeStatus: LikeStatusEnum.DISLIKE,
    });
  }
  async getUserLikeStatusForEntity(
    parentId: string,
    userId: string,
  ): Promise<LikeStatusEnum> {
    const likeData = await this.LikeModel.findOne({
      parentId,
      userId,
    });
    if (likeData) {
      return likeData.likeStatus;
    }
    return LikeStatusEnum.NONE;
  }

  async getNewestLikesForEntity(
    parentId: string,
  ): Promise<NewestLikeViewDto[]> {
    const lastLikes = await this.LikeModel.find({
      parentId,
      likeStatus: LikeStatusEnum.LIKE,
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    const userIds = lastLikes.map((like) => like.userId);
    const users = await this.UserModel.find({ _id: { $in: userIds } })
      .select('login')
      .lean();

    const userMap = new Map(
      users.map((user) => [user._id.toString(), user.login]),
    );

    return lastLikes.map((like) => ({
      addedAt: like.createdAt || new Date(),
      userId: like.userId,
      login: userMap.get(like.userId) || 'Unknown User',
    }));
  }

  async getEntityLikesInfo(
    parentId: string,
    userId?: string,
  ): Promise<LikesInfoViewDto> {
    const likesCount = await this.getEntityLikesCount(parentId);
    const dislikesCount = await this.getEntityDislikesCount(parentId);
    const likeStatus = userId
      ? await this.getUserLikeStatusForEntity(parentId, userId)
      : LikeStatusEnum.NONE;
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
    parentIds: string[];
    userId?: string;
  }): Promise<Record<string, LikesInfoViewDto>> {
    const pipeline = [
      {
        $match: {
          parentId: { $in: parentIds },
        },
      },
      {
        $group: {
          _id: '$parentId',
          likesCount: {
            $sum: {
              $cond: [{ $eq: ['$likeStatus', LikeStatusEnum.LIKE] }, 1, 0],
            },
          },
          dislikesCount: {
            $sum: {
              $cond: [{ $eq: ['$likeStatus', LikeStatusEnum.DISLIKE] }, 1, 0],
            },
          },
          myStatuses: {
            $push: {
              $cond: [{ $eq: ['$userId', userId] }, '$likeStatus', null],
            },
          },
        },
      },
      {
        $project: {
          likesCount: 1,
          dislikesCount: 1,
          myStatus: {
            $ifNull: [
              {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$myStatuses',
                      cond: { $ne: ['$$this', null] },
                    },
                  },
                  0,
                ],
              },
              LikeStatusEnum.NONE,
            ],
          },
        },
      },
    ];

    const likesInfo: AggregatedLikeInfo[] =
      await this.LikeModel.aggregate(pipeline);

    const result: Record<string, LikesInfoViewDto> = {};

    parentIds.forEach((commentId) => {
      result[commentId] = {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatusEnum.NONE,
      };
    });

    likesInfo.forEach((info) => {
      result[info._id] = {
        likesCount: info.likesCount,
        dislikesCount: info.dislikesCount,
        myStatus: info.myStatus,
      };
    });

    return result;
  }

  async getBulkNewestLikesInfo(
    parentIds: string[],
  ): Promise<Record<string, NewestLikeViewDto[]>> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          parentId: { $in: parentIds },
          likeStatus: { $in: [LikeStatusEnum.LIKE] },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$parentId',
          likes: {
            $push: {
              userId: '$userId',
              createdAt: '$createdAt',
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          likes: { $slice: ['$likes', 3] },
        },
      },
    ];

    const results: AggregatedNewestLikesData[] =
      await this.LikeModel.aggregate(pipeline);
    const userIds = results.flatMap((result) =>
      result.likes.map((like) => like.userId),
    );
    const users = await this.UserModel.find({ _id: { $in: userIds } })
      .select('login')
      .lean();

    const userMap = new Map(
      users.map((user) => [user._id.toString(), user.login]),
    );

    const resultMap: Record<string, NewestLikeViewDto[]> = {};
    results.forEach((result) => {
      resultMap[result._id] = result.likes.map(
        (like: { userId: string; createdAt: Date }) => ({
          addedAt: like.createdAt || new Date(),
          userId: like.userId,
          login: userMap.get(like.userId) || 'Unknown User',
        }),
      );
    });

    parentIds.forEach((id) => {
      if (!resultMap[id]) {
        resultMap[id] = [];
      }
    });

    return resultMap;
  }
}
