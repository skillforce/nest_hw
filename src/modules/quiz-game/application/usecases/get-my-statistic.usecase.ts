import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameSessionParticipantsRepository } from '../../infrastructure/game-session-participants.repository';
import { GameSessionsRepository } from '../../infrastructure/game_session.repository';
import { GameStatisticsViewDto } from '../../api/dto/game-statistics-view-dto';

export class GetMyStatisticCommand {
  constructor(public userId: number) {}
}

@CommandHandler(GetMyStatisticCommand)
export class GetMyStatisticUsecase
  implements ICommandHandler<GetMyStatisticCommand, GameStatisticsViewDto>
{
  constructor(
    private gameSessionParticipantsRepository: GameSessionParticipantsRepository,
    private gameSessionsRepository: GameSessionsRepository,
  ) {}

  async execute({
    userId,
  }: GetMyStatisticCommand): Promise<GameStatisticsViewDto> {
    const { totalScore, sessionsCount, gameSessionsIds } =
      await this.gameSessionParticipantsRepository.getUserScoreAndSessionsCount(
        userId,
      );
    const averageScore = sessionsCount > 0 ? totalScore / sessionsCount : 0;

    const { winsCount, lossesCount } =
      await this.gameSessionsRepository.getUserWinsAndLosesCount(
        gameSessionsIds,
        userId,
      );

    const drawsCount = sessionsCount - winsCount - lossesCount;

    return GameStatisticsViewDto.mapToViewDto({
      sumScore: totalScore,
      avgScores: Number(averageScore.toFixed(2)),
      gamesCount: sessionsCount,
      winsCount,
      lossesCount,
      drawsCount,
    });
  }
}
