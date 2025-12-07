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
    const activeParticipant =
      await this.gameSessionParticipantsRepository.findActiveByUserIdOrNotFoundFail(
        userId,
      );

    const gameSession = await this.gameSessionsRepository.findOrNotFoundFail(
      activeParticipant.game_session_id,
    );

    const secondParticipant =
      await this.gameSessionParticipantsRepository.findSecondParticipantByGameSessionId(
        activeParticipant.game_session_id,
        userId,
      );

    const emptyFirstParticipantProgress = PlayerProgressDto.mapToViewDto(
      [],
      {
        id: activeParticipant.user_id.toString(),
        login: activeParticipant.user.login,
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
        activeParticipant.id,
      );
    const secondParticipantAnswers =
      await this.gameSessionsQuestionsAnswersRepository.findAnswersByQuestionsIdsAndParticipantId(
        sessionQuestionsIds,
        secondParticipant.id,
      );
    const firstParticipantProgress = PlayerProgressDto.mapToViewDto(
      firstParticipantAnswers,
      {
        id: activeParticipant.user_id.toString(),
        login: activeParticipant.user.login,
      },
      activeParticipant.score ?? 0,
    );

    const secondParticipantProgress = PlayerProgressDto.mapToViewDto(
      secondParticipantAnswers,
      {
        id: secondParticipant.user_id.toString(),
        login: secondParticipant.user.login,
      },
      secondParticipant.score ?? 0,
    );

    console.log('ACTIVE PARTICIPANT', activeParticipant);
    console.log('SECOND PARTICIPANT', secondParticipant);

    const finishGameDate = this.getFinishGameDate(
      activeParticipant,
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
