import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../infrastructure/questions.repository';
import { AnswerQuestionDto, CreateQuestionDto } from '../../dto/question.dto';
import { CreateQuestionDomainDto } from '../../domain/dto/question-domain.dto';
import { Question } from '../../domain/question.entity';
import { AnswerQuestionViewDto } from '../../api/dto/game-session-view-dto';
import { GameSessionParticipantsRepository } from '../../infrastructure/game-session-participants.repository';
import { GameSessionsRepository } from '../../infrastructure/game_session.repository';
import { GameSessionQuestionsRepository } from '../../infrastructure/game-session-questions.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { GameSessionQuestionAnswerRepository } from '../../infrastructure/game-session-question-answer.repository';

export class AnswerQuestionCommand {
  constructor(
    public answerQuestionDto: AnswerQuestionDto,
    public userId: number,
  ) {}
}

@CommandHandler(AnswerQuestionCommand)
export class AnswerQuestionUsecase
  implements ICommandHandler<AnswerQuestionCommand, AnswerQuestionViewDto>
{
  constructor(
    private questionRepository: QuestionsRepository,
    private gameSessionParticipantsRepository: GameSessionParticipantsRepository,
    private gameSessionsRepository: GameSessionsRepository,
    private gameSessionsQuestionsRepository: GameSessionQuestionsRepository,
    private gameSessionQuestionAnswerRepository: GameSessionQuestionAnswerRepository,
    private questionsRepository: QuestionsRepository,
  ) {}

  async execute({
    answerQuestionDto,
    userId,
  }: AnswerQuestionCommand): Promise<AnswerQuestionViewDto> {
    const gameSession =
      await this.gameSessionsRepository.findActiveGameSessionByUserId(userId);
    if (!gameSession) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Game session not found',
      });
    }

    const gameSessionParticipant =
      await this.gameSessionParticipantsRepository.findActiveByUserId(userId);

    if (!gameSessionParticipant) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Game session not found',
      });
    }

    const gameSessionQuestions =
      await this.gameSessionsQuestionsRepository.findByGameSessionId(
        gameSession.id,
      );

    const gameSessionQuestionIds = gameSessionQuestions.map(
      (question) => question.id,
    );
    const getAllGameSessionQuestionAnswers =
      await this.gameSessionQuestionAnswerRepository.findAnswersByQuestionsIdsAndParticipantId(
        gameSessionQuestionIds,
        gameSessionParticipant.id,
      );
  }
}
