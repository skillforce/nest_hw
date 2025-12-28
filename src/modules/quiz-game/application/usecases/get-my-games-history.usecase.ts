import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  GameSessionViewDto,
  GameStatus,
  PlayerProgressDto,
  QuestionDto,
} from '../../api/dto/game-session-view-dto';
import { GameSessionsRepository } from '../../infrastructure/game_session.repository';
import { GameSessionParticipants } from '../../domain/game-session-participants.entity';
import { GetMyGamesHistoryQueryParamsInputDto } from '../../api/dto/get-my-games-history-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GameSession } from '../../domain/game-session.entity';

export class GetMyGamesHistoryCommand {
  constructor(
    public userId: number,
    public query: GetMyGamesHistoryQueryParamsInputDto,
  ) {}
}

@CommandHandler(GetMyGamesHistoryCommand)
export class GetMyGamesHistoryUsecase
  implements
    ICommandHandler<
      GetMyGamesHistoryCommand,
      PaginatedViewDto<GameSessionViewDto[]>
    >
{
  constructor(private gameSessionsRepository: GameSessionsRepository) {}
  async execute({
    userId,
    query,
  }: GetMyGamesHistoryCommand): Promise<
    PaginatedViewDto<GameSessionViewDto[]>
  > {
    const gameSessions = await this.gameSessionsRepository.findAllByUserId(
      userId,
      query,
    );

    const gameSessionItems = this.getGameSessionItems(gameSessions.items);

    return {
      ...gameSessions,
      items: gameSessionItems,
    };
  }

  private getFinishGameDate(
    firstParticipant: GameSessionParticipants,
    secondParticipant: GameSessionParticipants,
    winnerId: number,
  ) {
    if (!firstParticipant?.finished_at && !secondParticipant?.finished_at) {
      return null;
    }
    if (firstParticipant.user.id === +winnerId) {
      return firstParticipant.finished_at.toString();
    }
    return secondParticipant.finished_at.toString();
  }
  private createPlayerProgressDto(
    participant: GameSessionParticipants,
    isEmpty?: boolean,
  ): PlayerProgressDto {
    if (isEmpty || !participant) {
      return PlayerProgressDto.mapToViewDto(
        [],
        {
          id: participant.user_id.toString(),
          login: participant.user.login,
        },
        0,
      );
    }
    return PlayerProgressDto.mapToViewDto(
      participant.gameSessionQuestionAnswers,
      {
        id: participant.user_id.toString(),
        login: participant.user.login,
      },
      participant.score ?? 0,
    );
  }
  private getGameSessionItems(
    gameSessions: Array<GameSession> | null,
  ): GameSessionViewDto[] {
    return gameSessions?.length
      ? gameSessions.map((gameSessionItem) => {
          const [participant1, participant2] = gameSessionItem.participants;
          const isSessionStarted = !!gameSessionItem.session_started_at;
          const firstParticipantProgress = this.createPlayerProgressDto(
            participant1,
            !isSessionStarted,
          );
          const finishGameDate = this.getFinishGameDate(
            participant1,
            participant2,
            gameSessionItem.winner_id,
          );
          const secondParticipantProgress = isSessionStarted
            ? this.createPlayerProgressDto(participant2)
            : null;

          const gameStatus: GameStatus = gameSessionItem.winner_id
            ? 'Finished'
            : 'Active';

          const gameSessionQuestions = gameSessionItem.questions.map(
            QuestionDto.mapToViewDto,
          );

          return GameSessionViewDto.mapToViewDto(
            gameSessionItem,
            firstParticipantProgress,
            secondParticipantProgress,
            gameSessionQuestions,
            gameStatus,
            finishGameDate,
          );
        })
      : [];
  }
}
