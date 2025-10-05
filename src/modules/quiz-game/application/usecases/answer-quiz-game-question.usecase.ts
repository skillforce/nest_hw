import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../infrastructure/questions.repository';
import { AnswerQuestionDto } from '../../dto/question.dto';
import { AnswerQuestionViewDto } from '../../api/dto/game-session-view-dto';
import { GameSessionParticipantsRepository } from '../../infrastructure/game-session-participants.repository';
import { GameSessionsRepository } from '../../infrastructure/game_session.repository';
import { GameSessionQuestionsRepository } from '../../infrastructure/game-session-questions.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { GameSessionQuestionAnswerRepository } from '../../infrastructure/game-session-question-answer.repository';
import {
  AnswerStatus,
  GameSessionQuestionAnswer,
} from '../../domain/game-session-question-answers.entity';
import { GameSessionQuestion } from '../../domain/game-session-questions.entity';

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
    const allGameSessionQuestionAnswersForCurrentParticipant =
      await this.gameSessionQuestionAnswerRepository.findAnswersByQuestionsIdsAndParticipantId(
        gameSessionQuestionIds,
        gameSessionParticipant.id,
      );

    const firstUnansweredQuestion =
      [...gameSessionQuestions]
        .sort((a, b) => a.order_index - b.order_index)
        .find((q) => {
          const answer =
            allGameSessionQuestionAnswersForCurrentParticipant.find(
              (ans) => ans.game_session_question_id === q.id,
            );
          return !answer || answer.answer_status === AnswerStatus.PENDING;
        }) ?? null;

    if (!firstUnansweredQuestion) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'No not answered questions found',
      });
    }

    return await this.answerQuestion(
      firstUnansweredQuestion,
      gameSessionParticipant.id,
      answerQuestionDto.answer,
    );
  }

  private async answerQuestion(
    gameSessionQuestion: GameSessionQuestion,
    participantId: number,
    answer: string,
  ): Promise<AnswerQuestionViewDto> {
    const question = await this.questionsRepository.findOrNotFoundFail(
      gameSessionQuestion.question_id,
    );
    const newAnswer = new GameSessionQuestionAnswer();
    newAnswer.game_session_question_id = gameSessionQuestion.id;
    newAnswer.participant_id = participantId;
    newAnswer.answer = answer;
    newAnswer.answer_status = question?.answers.includes(answer)
      ? AnswerStatus.CORRECT
      : AnswerStatus.INCORRECT;

    await this.gameSessionQuestionAnswerRepository.save(newAnswer);

    return AnswerQuestionViewDto.mapToViewDto(newAnswer, question.id);
  }
}
