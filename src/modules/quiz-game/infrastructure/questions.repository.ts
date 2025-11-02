import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Question } from '../domain/question.entity';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsOrmRepository: Repository<Question>,
  ) {}

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
  async findOrNotFoundFail(id: number): Promise<Question> {
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

    return question;
  }

  async getFiveRandomQuestions(): Promise<Question[]> {
    console.log('33333');
    return await this.questionsOrmRepository
      .createQueryBuilder('q')
      .where('q.isPublished = true AND q.deletedAt IS NULL')
      .orderBy('RANDOM()')
      .limit(5)
      .getMany();
  }

  async save(
    question: Omit<Question, 'id'> & { id?: number },
  ): Promise<number> {
    const result = await this.questionsOrmRepository.save(question);

    return result.id;
  }
}
