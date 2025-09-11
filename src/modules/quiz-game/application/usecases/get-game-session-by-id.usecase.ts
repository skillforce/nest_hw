import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  GameSessionViewDto,
  PlayerProgressDto,
  QuestionDto,
} from '../../api/dto/game-session-view-dto';
import { GameSessionParticipantsRepository } from '../../infrastructure/game-session-participants.repository';
import { GameSessionQuestionsRepository } from '../../infrastructure/game-session-questions.repository';
import { GameSessionsRepository } from '../../infrastructure/game_session.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { GameSessionQuestionAnswerRepository } from '../../infrastructure/game-session-question-answer.repository';
import { GameSessionParticipants } from '../../domain/game-session-participants.entity';

export class GetGameSessionByIdCommand {
  constructor(
    public gameSessionId: number,
    public userId: number,
  ) {}
}

@CommandHandler(GetGameSessionByIdCommand)
export class GetGameSessionByIdUsecase
  implements ICommandHandler<GetGameSessionByIdCommand, GameSessionViewDto>
{
  constructor(
    private gameSessionParticipantsRepository: GameSessionParticipantsRepository,
    private gameSessionsRepository: GameSessionsRepository,
    private gameSessionsQuestionsRepository: GameSessionQuestionsRepository,
    private gameSessionsQuestionsAnswersRepository: GameSessionQuestionAnswerRepository,
  ) {}

  async execute({
    gameSessionId,
    userId,
  }: GetGameSessionByIdCommand): Promise<GameSessionViewDto> {
    const gameSession =
      await this.gameSessionsRepository.findOrNotFoundFail(gameSessionId);
    const participants =
      await this.gameSessionParticipantsRepository.findByGameSessionId(
        gameSessionId,
      );

    this.checkIfUserIsParticipant(participants, userId);

    const firstParticipant = participants.find(
      (participant) => participant.user.id === userId,
    );
    const secondParticipant = participants.find(
      (participant) => participant.user.id !== userId,
    );

    if (!firstParticipant || !secondParticipant) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'no active game session',
            message: 'no active game session found',
          },
        ],
        message: 'no active game session found',
      });
    }

    if (participants.length === 1) {
      const emptyFirstParticipantProgress = PlayerProgressDto.mapToViewDto(
        [],
        {
          id: userId.toString(),
          login: firstParticipant.user.login,
        },
        0,
      );
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
        userId,
      );
    const secondParticipantAnswers =
      await this.gameSessionsQuestionsAnswersRepository.findAnswersByQuestionsIdsAndParticipantId(
        sessionQuestionsIds,
        participants.find((participant) => participant.user.id !== userId)!.id,
      );

    const firstParticipantProgress = PlayerProgressDto.mapToViewDto(
      firstParticipantAnswers,
      {
        id: firstParticipant.id.toString(),
        login: firstParticipant.user.login,
      },
      firstParticipant.score,
    );
    const secondParticipantProgress = PlayerProgressDto.mapToViewDto(
      secondParticipantAnswers,
      {
        id: secondParticipant.id.toString(),
        login: secondParticipant.user.login,
      },
      secondParticipant.score,
    );

    const finishGameDate = this.getFinishGameDate(
      firstParticipant,
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
    winnerId: string,
  ) {
    if (!winnerId) {
      return null;
    }
    if (firstParticipant.user.id === +winnerId) {
      return firstParticipant.finished_at.toString();
    }
    return secondParticipant.finished_at.toString();
  }
  private checkIfUserIsParticipant(
    participants: GameSessionParticipants[],
    userId: number,
  ) {
    const participant = participants.find(
      (participant) => participant.user.id === userId,
    );
    if (!participant) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        extensions: [
          {
            field: 'user is not participant',
            message: 'user is not participant',
          },
        ],
        message: 'user is not participant',
      });
    }
  }
}
