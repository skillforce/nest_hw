import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { GameSessionQuestionAnswer } from '../domain/game-session-question-answers.entity';

@Injectable()
export class GameSessionQuestionAnswerRepository {
  constructor(
    @InjectRepository(GameSessionQuestionAnswer)
    private readonly gameSessionQuestionAnswerOrmRepository: Repository<GameSessionQuestionAnswer>,
  ) {}

  async findById(id: number): Promise<GameSessionQuestionAnswer | null> {
    if (!Number.isInteger(Number(id))) {
      return null;
    }
    return await this.gameSessionQuestionAnswerOrmRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
  }
  async findOrNotFoundFail(id: number): Promise<GameSessionQuestionAnswer> {
    const gsQuestionAnswer = await this.findById(id);

    if (!gsQuestionAnswer) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'game session question answer',
            message: 'game session question answer not found',
          },
        ],
        message: 'game session question answer not found',
      });
    }

    return gsQuestionAnswer;
  }

  async findAnswersByQuestionsIdsAndParticipantId(
    questionIds: number[],
    participantId: number,
  ): Promise<GameSessionQuestionAnswer[]> {
    return await this.gameSessionQuestionAnswerOrmRepository.find({
      where: {
        game_session_question_id: In(questionIds),
        participant_id: participantId,
        deletedAt: IsNull(),
      },
    });
  }

  async save(
    gameSessionQuestionAnswer: Omit<GameSessionQuestionAnswer, 'id'> & {
      id?: number;
    },
  ): Promise<number> {
    const result = await this.gameSessionQuestionAnswerOrmRepository.save(
      gameSessionQuestionAnswer,
    );

    return result.id;
  }
}
