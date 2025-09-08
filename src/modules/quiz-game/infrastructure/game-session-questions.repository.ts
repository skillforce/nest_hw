import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { GameSessionQuestion } from '../domain/game-session-questions.entity';

@Injectable()
export class GameSessionQuestionsRepository {
  constructor(
    @InjectRepository(GameSessionQuestion)
    private readonly gameSessionQuestionOrmRepository: Repository<GameSessionQuestion>,
  ) {}

  async findById(id: number): Promise<GameSessionQuestion | null> {
    if (!Number.isInteger(Number(id))) {
      return null;
    }
    return await this.gameSessionQuestionOrmRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
  }
  async findOrNotFoundFail(id: number): Promise<GameSessionQuestion> {
    const gsQuestion = await this.findById(id);

    if (!gsQuestion) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'game session question',
            message: 'game session question not found',
          },
        ],
        message: 'game session question not found',
      });
    }

    return gsQuestion;
  }

  async findByGameSessionId(gameSessionId: number) {
    return await this.gameSessionQuestionOrmRepository.find({
      where: {
        game_session_id: gameSessionId,
        deletedAt: IsNull(),
      },
      relations: ['question'],
    });
  }

  async save(
    gameSessionQuestion: Omit<GameSessionQuestion, 'id'> & {
      id?: number;
    },
  ): Promise<number> {
    const result =
      await this.gameSessionQuestionOrmRepository.save(gameSessionQuestion);

    return result.id;
  }
}
