import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  GameSessionViewDto,
  PlayerProgressDto,
  QuestionDto,
} from '../../api/dto/game-session-view-dto';
import { GameSessionParticipantsRepository } from '../../infrastructure/game-session-participants.repository';
import { GameSessionQuestionsRepository } from '../../infrastructure/game-session-questions.repository';
import { GameSessionsRepository } from '../../infrastructure/game_session.repository';
import { GameSessionQuestionAnswerRepository } from '../../infrastructure/game-session-question-answer.repository';
import { GameSessionParticipants } from '../../domain/game-session-participants.entity';

import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export class GetMyCurrentPairCommand {
  constructor(public userId: number) {}
}

@CommandHandler(GetMyCurrentPairCommand)
export class GetMyCurrentPairUsecase
  implements ICommandHandler<GetMyCurrentPairCommand, GameSessionViewDto>
{
  constructor(
    private gameSessionParticipantsRepository: GameSessionParticipantsRepository,
    private gameSessionsRepository: GameSessionsRepository,
    private gameSessionsQuestionsRepository: GameSessionQuestionsRepository,
    private gameSessionsQuestionsAnswersRepository: GameSessionQuestionAnswerRepository,
  ) {}

  async execute({
    userId,
  }: GetMyCurrentPairCommand): Promise<GameSessionViewDto> {
    let targetParticipant: GameSessionParticipants;
    const activeParticipant =
      await this.gameSessionParticipantsRepository.findActiveByUserId(userId);

    if (!activeParticipant) {
      const mostRecentParticipant =
        await this.gameSessionParticipantsRepository.findMostRecentByUserIdOrNotFoundFail(
          userId,
        );
      const recentGameSession =
        await this.gameSessionsRepository.findOrNotFoundFail(
          mostRecentParticipant.game_session_id,
        );
      if (!recentGameSession.winner_id) {
        targetParticipant = mostRecentParticipant;
      } else {
        throw new DomainException({
          code: DomainExceptionCode.NotFound,
          extensions: [
            {
              field: 'game session participant',
              message: 'game session participant not found',
            },
          ],
          message: 'game session participant not found',
        });
      }
    } else {
      targetParticipant = activeParticipant;
    }

    const gameSession = await this.gameSessionsRepository.findOrNotFoundFail(
      targetParticipant.game_session_id,
    );

    const secondParticipant =
      await this.gameSessionParticipantsRepository.findSecondParticipantByGameSessionId(
        targetParticipant.game_session_id,
        userId,
      );

    const emptyFirstParticipantProgress = PlayerProgressDto.mapToViewDto(
      [],
      {
        id: targetParticipant.user_id.toString(),
        login: targetParticipant.user.login,
      },
      0,
    );

    if (!secondParticipant) {
      return GameSessionViewDto.mapToViewDto(
        gameSession,
        emptyFirstParticipantProgress,
        null,
        null,
        'PendingSecondPlayer',
        null,
      );
    }

    const sessionQuestions =
      await this.gameSessionsQuestionsRepository.findByGameSessionId(
        gameSession.id,
      );

    const sessionQuestionsIds = sessionQuestions.map((question) => question.id);
    const firstParticipantAnswers =
      await this.gameSessionsQuestionsAnswersRepository.findAnswersByQuestionsIdsAndParticipantId(
        sessionQuestionsIds,
        targetParticipant.id,
      );
    const secondParticipantAnswers =
      await this.gameSessionsQuestionsAnswersRepository.findAnswersByQuestionsIdsAndParticipantId(
        sessionQuestionsIds,
        secondParticipant.id,
      );
    const firstParticipantProgress = PlayerProgressDto.mapToViewDto(
      firstParticipantAnswers,
      {
        id: targetParticipant.user_id.toString(),
        login: targetParticipant.user.login,
      },
      targetParticipant.score ?? 0,
    );

    const secondParticipantProgress = PlayerProgressDto.mapToViewDto(
      secondParticipantAnswers,
      {
        id: secondParticipant.user_id.toString(),
        login: secondParticipant.user.login,
      },
      secondParticipant.score ?? 0,
    );

    const finishGameDate = this.getFinishGameDate(
      targetParticipant,
      secondParticipant,
      gameSession.winner_id,
    );

    const gameSessionStatus = gameSession.winner_id ? 'Finished' : 'Active';

    return GameSessionViewDto.mapToViewDto(
      gameSession,
      firstParticipantProgress,
      secondParticipantProgress,
      sessionQuestions.map(QuestionDto.mapToViewDto),
      gameSessionStatus,
      finishGameDate,
    );
  }

  private getFinishGameDate(
    firstParticipant: GameSessionParticipants,
    secondParticipant: GameSessionParticipants,
    winnerId: number,
  ) {
    if (!winnerId) {
      return null;
    }

    //TODO need to set finished_at when participant finishes all questions and FINISH DATE FOR GAME SESSION
    if (firstParticipant.user.id === +winnerId) {
      return firstParticipant.finished_at.toString();
    }
    return secondParticipant.finished_at.toString();
  }
}
