import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private readonly CommentModel: CommentModelType,
  ) {}

  async findById(id: string) {
    return this.CommentModel.findById({ _id: id, deletedAt: null });
  }
  async findByUserIdAndParentId(parentId: string, userId: string) {
    return this.CommentModel.findOne({ parentId, userId, deletedAt: null });
  }
  async findOrNotFoundFail(id: string): Promise<CommentDocument> {
    const comment = await this.findById(id);

    if (!comment) {
      throw new NotFoundException('comment not found');
    }

    return comment;
  }

  async save(comment: CommentDocument) {
    return comment.save();
  }
}
