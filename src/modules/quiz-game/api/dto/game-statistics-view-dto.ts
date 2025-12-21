export class GameStatisticsViewDto {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
  static mapToViewDto({
    sumScore,
    avgScores,
    gamesCount,
    winsCount,
    lossesCount,
    drawsCount,
  }: {
    sumScore: number;
    avgScores: number;
    gamesCount: number;
    winsCount: number;
    lossesCount: number;
    drawsCount: number;
  }): GameStatisticsViewDto {
    const dto = new GameStatisticsViewDto();

    dto.sumScore = sumScore;
    dto.avgScores = avgScores;
    dto.gamesCount = gamesCount;
    dto.winsCount = winsCount;
    dto.lossesCount = lossesCount;
    dto.drawsCount = drawsCount;
    return dto;
  }
}
