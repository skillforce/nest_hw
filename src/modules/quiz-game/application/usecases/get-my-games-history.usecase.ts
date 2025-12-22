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
import { GetMyGamesHistoryQueryParamsInputDto } from '../../api/dto/get-my-games-history-query-params.input-dto';

export class GetMyGamesHistoryCommand {
  constructor(
    public userId: number,
    query: GetMyGamesHistoryQueryParamsInputDto, //TODO ts is under question
  ) {}
}

@CommandHandler(GetMyGamesHistoryCommand)
export class GetMyGamesHistoryUsecase
  implements ICommandHandler<GetMyGamesHistoryCommand, GameSessionViewDto[]>
{
  constructor(
    private gameSessionParticipantsRepository: GameSessionParticipantsRepository,
    private gameSessionsRepository: GameSessionsRepository,
    private gameSessionsQuestionsRepository: GameSessionQuestionsRepository,
    private gameSessionsQuestionsAnswersRepository: GameSessionQuestionAnswerRepository,
  ) {}
  //TODO don't forget to handle queries conditions (sort + pagination etc.)
  async execute({
    userId,
  }: GetMyGamesHistoryCommand): Promise<GameSessionViewDto[]> {
    const gameSessions =
      await this.gameSessionsRepository.findFinishedByUserId(userId);

    if (!gameSessions || gameSessions.length === 0) {
      return [];
    }

    return gameSessions.map((gameSessionItem) => {
      const firstParticipantProgress = PlayerProgressDto.mapToViewDto(
        gameSessionItem.participants[0].gameSessionQuestionAnswers,
        {
          id: gameSessionItem.participants[0].user_id.toString(),
          login: gameSessionItem.participants[0].user.login,
        },
        gameSessionItem.participants[0].score ?? 0,
      );
      const secondParticipantProgress = PlayerProgressDto.mapToViewDto(
        gameSessionItem.participants[1].gameSessionQuestionAnswers,
        {
          id: gameSessionItem.participants[1].user_id.toString(),
          login: gameSessionItem.participants[1].user.login,
        },
        gameSessionItem.participants[1].score ?? 0,
      );

      return GameSessionViewDto.mapToViewDto(
        gameSessionItem,
        firstParticipantProgress,
        secondParticipantProgress,
        gameSessionItem.questions.map(QuestionDto.mapToViewDto),
        'Finished',
        this.getFinishGameDate(
          gameSessionItem.participants[0],
          gameSessionItem.participants[1],
          gameSessionItem.winner_id,
        ),
      );
    });
  }

  private getFinishGameDate(
    firstParticipant: GameSessionParticipants,
    secondParticipant: GameSessionParticipants,
    winnerId: number,
  ) {
    if (firstParticipant.user.id === +winnerId) {
      return firstParticipant.finished_at.toString();
    }
    return secondParticipant.finished_at.toString();
  }
}
