import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery } from 'mongoose';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { Comment, CommentModelType } from '../../domain/comment.entity';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { GetCommentsQueryParams } from '../../api/input-dto/comment-input-dto/get-comments-query-params.input-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private readonly CommentModel: CommentModelType,
  ) {}
  async getByIdOrNotFoundFail(
    id: string,
  ): Promise<Omit<CommentViewDto, 'likesInfo'>> {
    const comment = await this.CommentModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!comment) {
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

    return CommentViewDto.mapToViewDto(comment);
  }

  async getAll(
    query: GetCommentsQueryParams,
    additionalFilter: FilterQuery<Comment> = {},
  ): Promise<PaginatedViewDto<Omit<CommentViewDto, 'likesInfo'>[]>> {
    const filter: FilterQuery<Comment> = {
      deletedAt: null,
      ...additionalFilter,
    };

    const comments = await this.CommentModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.CommentModel.countDocuments(filter);
    const items = comments.map(CommentViewDto.mapToViewDto);

    return PaginatedViewDto.mapToView({
      items,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }
}
