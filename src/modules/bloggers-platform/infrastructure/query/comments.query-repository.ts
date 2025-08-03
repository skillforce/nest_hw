import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { Comment } from '../../domain/comment.entity';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { GetCommentsQueryParams } from '../../api/input-dto/comment-input-dto/get-comments-query-params.input-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectRepository(Comment)
    private commentOrmRepository: Repository<Comment>,
  ) {}
  async getByIdOrNotFoundFail(
    id: number,
  ): Promise<Omit<CommentViewDto, 'likesInfo'>> {
    const result = await this.commentOrmRepository
      .createQueryBuilder('c')
      .innerJoin('c.creator', 'u', 'u.deletedAt IS NULL')
      .addSelect(['u.login'])
      .where('c.id = :id', { id })
      .andWhere('c.deletedAt IS NULL')
      .getOne();

    if (!result) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'comment',
            message: 'comment not found',
          },
        ],
        message: 'comment not found',
      });
    }

    return CommentViewDto.mapToViewDto(result as Comment & { login: string });
  }

  async getAll(
    query: GetCommentsQueryParams,
    additionalFilter: FilterQuery<Comment> = {},
  ): Promise<PaginatedViewDto<Omit<CommentViewDto, 'likesInfo'>[]>> {
    const sortDirection =
      query.sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const sortBy = query.sortBy;
    const skip = query.calculateSkip();
    const limit = query.pageSize;

    let whereConditions: FindOptionsWhere<Comment>[] = [];

    if (additionalFilter.postId) {
      whereConditions = [
        { deletedAt: IsNull(), postId: additionalFilter.postId },
      ];
    } else {
      whereConditions = [{ deletedAt: IsNull() }];
    }

    const [comments, totalCount] = await this.commentOrmRepository.findAndCount(
      {
        where: whereConditions,
        order: { [sortBy]: sortDirection },
        skip,
        take: limit,
        relations: ['creator'],
      },
    );

    const items = comments.map(CommentViewDto.mapToViewDto);

    return PaginatedViewDto.mapToView({
      items,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }
}
