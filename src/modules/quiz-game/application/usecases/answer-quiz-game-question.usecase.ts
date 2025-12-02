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
import { GameSessionParticipants } from '../../domain/game-session-participants.entity';
import { GameSession } from '../../domain/game-session.entity';

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

    console.log(gameSession);
    console.log(gameSessionParticipant);

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

    if (!gameSession.winner_id && firstUnansweredQuestion?.order_index === 5) {
      await this.checkAndSetWinner(gameSession.id, userId);
      await this.increasePlayerScore(gameSessionParticipant);
    }
    return await this.answerQuestion(
      firstUnansweredQuestion,
      gameSessionParticipant.id,
      answerQuestionDto.answer,
      gameSessionParticipant,
    );
  }

  private async answerQuestion(
    gameSessionQuestion: GameSessionQuestion,
    participantId: number,
    answer: string,
    gameSessionParticipant: GameSessionParticipants,
  ): Promise<AnswerQuestionViewDto> {
    const question = await this.questionsRepository.findOrNotFoundFail(
      gameSessionQuestion.question_id,
    );
    const newAnswer = new GameSessionQuestionAnswer();

    const isAnswerCorrect = question?.answers.includes(answer);
    newAnswer.game_session_question_id = gameSessionQuestion.id;
    newAnswer.participant_id = participantId;
    newAnswer.answer = answer;
    newAnswer.answer_status = isAnswerCorrect
      ? AnswerStatus.CORRECT
      : AnswerStatus.INCORRECT;
    if (isAnswerCorrect) {
      await this.increasePlayerScore(gameSessionParticipant);
    }

    await this.gameSessionQuestionAnswerRepository.save(newAnswer);

    return AnswerQuestionViewDto.mapToViewDto(newAnswer, question.id);
  }

  private async checkAndSetWinner(sessionId: number, userId: number) {
    try {
      await this.gameSessionsRepository.updateWinner(sessionId, userId);
    } catch (e) {
      console.log(e);
    }
  }

  private async increasePlayerScore(
    gameSessionParticipant: GameSessionParticipants,
  ) {
    const updatedParticipant = {
      ...gameSessionParticipant,
      score: gameSessionParticipant.score + 1,
    };
    await this.gameSessionParticipantsRepository.save(updatedParticipant);
  }
}
