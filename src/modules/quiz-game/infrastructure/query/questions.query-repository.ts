import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../../domain/question.entity';
import { IsNull, Repository } from 'typeorm';
import { GetQuestionsQueryParams } from '../../api/dto/question-input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { QuestionViewDto } from '../../api/dto/question-view-dto';
import { FilterQuery } from 'mongoose';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsOrmRepository: Repository<Question>,
  ) {}
  async getAll(
    query: GetQuestionsQueryParams,
    additionalFilters: FilterQuery<Question> = {}, // mongoose????
  ): Promise<PaginatedViewDto<QuestionViewDto[]>> {
    const sortDirection =
      query.sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const skip = query.calculateSkip();
    const limit = query.pageSize;

    const qb = this.questionsOrmRepository
      .createQueryBuilder('question')
      .where('question.deletedAt IS NULL');

    if (additionalFilters.bodySearchTerm) {
      qb.andWhere('question.body = :body', {
        body: +additionalFilters.bodySearchTerm,
      });
    }

    const sortBy = query.sortBy;

    if (sortBy) {
      qb.orderBy(`question.${sortBy}`, sortDirection);
    }

    qb.skip(skip).take(limit);

    const [questions, totalCount] = await qb.getManyAndCount();

    const items = questions.map(QuestionViewDto.mapToViewDto);

    return PaginatedViewDto.mapToView({
      items,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }
  async findById(id: number): Promise<Question | null> {
    if (!Number.isInteger(Number(id))) {
      return null;
    }
    return await this.questionsOrmRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
  }
  async findOrNotFoundFail(id: number): Promise<QuestionViewDto> {
    const question = await this.findById(id);

    if (!question) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'question',
            message: 'question not found',
          },
        ],
        message: 'question not found',
      });
    }

    return QuestionViewDto.mapToViewDto(question);
  }
}
