import { Injectable } from '@nestjs/common';
import { Like } from '../domain/like.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class LikesRepository {
  constructor(
    @InjectRepository(Like) private likeOrmRepository: Repository<Like>,
  ) {}
  async findByUserIdAndParentId(userId: number, parentId: number) {
    return await this.likeOrmRepository.findOne({
      where: {
        userId,
        parentId,
        deletedAt: IsNull(),
      },
    });
  }
  async save(like: Omit<Like, 'id'> & { id?: number }) {
    const result = await this.likeOrmRepository.save(like);

    return result.id;
  }
}
