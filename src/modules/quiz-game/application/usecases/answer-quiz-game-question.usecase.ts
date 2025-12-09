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
    const gameSessionParticipant =
      await this.gameSessionParticipantsRepository.findActiveByUserId(userId);
    if (
      !gameSession ||
      !gameSessionParticipant ||
      !gameSession.session_started_at
    ) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
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
      gameSessionParticipant,
      gameSession,
      firstUnansweredQuestion?.order_index === 5,
    );
  }

  private async answerQuestion(
    gameSessionQuestion: GameSessionQuestion,
    participantId: number,
    answer: string,
    gameSessionParticipant: GameSessionParticipants,
    gameSession: GameSession,
    isLastQuestion: boolean = false,
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
      console.log('Increase score for participant:', participantId);
      await this.increasePlayerScore(gameSessionParticipant);
    }

    await this.gameSessionQuestionAnswerRepository.save(newAnswer);
    if (isLastQuestion) {
      const updatedParticipant = isAnswerCorrect
        ? {
            ...gameSessionParticipant,
            score: gameSessionParticipant.score + 1,
            finished_at: new Date(),
          }
        : { ...gameSessionParticipant, finished_at: new Date() };
      await this.handleLastQuestionCase(updatedParticipant, gameSession);
    }

    return AnswerQuestionViewDto.mapToViewDto(newAnswer, question.id);
  }

  private async calculateWinnerIdAndSave(
    firstParticipant: GameSessionParticipants,
    secondParticipant: GameSessionParticipants,
    game_session_id: number,
  ): Promise<number | null> {
    const firstTime = new Date(firstParticipant.finished_at).getTime();
    const secondTime = new Date(secondParticipant.finished_at).getTime();
    let firstParticipantScore = firstParticipant.score ?? 0;
    let secondParticipantScore = secondParticipant.score ?? 0;
    if (firstTime > secondTime && secondParticipantScore !== 0) {
      await this.increasePlayerScore(secondParticipant);
      secondParticipantScore++;
    } else if (secondTime > firstTime && firstParticipantScore !== 0) {
      await this.increasePlayerScore(firstParticipant);
      firstParticipantScore++;
    }
    let winnerId: number;
    if (firstParticipantScore > secondParticipantScore) {
      winnerId = firstParticipant.user.id;
    } else if (secondParticipantScore > firstParticipantScore) {
      winnerId = secondParticipant.user.id;
    } else {
      winnerId = 0;
    }
    if (winnerId) {
      await this.updateGameSessionWinner(game_session_id, winnerId);
    }
    return winnerId;
  }

  private async updateGameSessionWinner(sessionId: number, winnerId: number) {
    await this.gameSessionsRepository.updateWinner(sessionId, winnerId);
  }

  private async handleLastQuestionCase(
    finishedGameSessionParticipant: GameSessionParticipants,
    gameSession: GameSession,
  ) {
    await this.setParticipantFinishedAt(finishedGameSessionParticipant);

    const participants =
      await this.gameSessionParticipantsRepository.findByGameSessionId(
        gameSession.id,
        true,
      );
    const firstParticipant = finishedGameSessionParticipant;
    const secondParticipant = participants.find(
      (participant) =>
        participant.user_id !== finishedGameSessionParticipant.user_id,
    );

    if (
      !gameSession.winner_id &&
      firstParticipant?.finished_at &&
      secondParticipant?.finished_at
    ) {
      await this.calculateWinnerIdAndSave(
        firstParticipant,
        secondParticipant,
        gameSession.id,
      );
    }
  }

  private async setParticipantFinishedAt(
    gameSessionParticipant: GameSessionParticipants,
  ) {
    await this.gameSessionParticipantsRepository.save(gameSessionParticipant);
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
