import { Injectable } from '@nestjs/common';
import { Post } from '../domain/post.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postsOrmRepository: Repository<Post>,
  ) {}

  async findById(id: number): Promise<Post | null> {
    if (!Number.isInteger(Number(id))) {
      return null;
    }
    return await this.postsOrmRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
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
    const result = await this.postsOrmRepository.save(post);

    return result.id;
  }
}
