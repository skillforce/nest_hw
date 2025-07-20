import { LikeStatusEnum } from './dto/like-domain.dto';

export class Like {
  id: number;
  parentId: string;
  userId: number;
  likeStatus: LikeStatusEnum;
  deletedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}
