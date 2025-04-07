import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like, LikeDocument, LikeModelType } from '../domain/like.entity';

@Injectable()
export class LikesRepository {
  constructor(
    @InjectModel(Like.name) private readonly LikeModel: LikeModelType,
  ) {}
  async findByUserIdAndParentId(userId: string, parentId: string) {
    return this.LikeModel.findOne({ parentId, userId, deletedAt: null });
  }
  async save(like: LikeDocument) {
    return like.save();
  }
}
