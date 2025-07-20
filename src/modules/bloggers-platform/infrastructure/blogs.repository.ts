import { Injectable } from '@nestjs/common';
import { Blog } from '../domain/blog.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsOrmRepository: Repository<Blog>,
  ) {}

  async findById(id: number): Promise<Blog | null> {
    if (!Number.isInteger(Number(id))) {
      return null;
    }
    return await this.blogsOrmRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
  }
  async findOrNotFoundFail(id: number): Promise<Blog> {
    const blog = await this.findById(id);
    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `Blog with id ${id} not found`,
        extensions: [
          {
            field: 'blog',
            message: `Blog with id ${id} not found`,
          },
        ],
      });
    }

    return blog;
  }

  async save(blog: Omit<Blog, 'id'> & { id?: number }): Promise<number> {
    const result = await this.blogsOrmRepository.save(blog);

    return result.id;
  }
}
