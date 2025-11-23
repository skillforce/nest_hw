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
        true,
      );

    this.checkIfUserIsParticipant(participants, userId);
    //TODO remove ! to handle nulls properly
    const firstParticipant = participants.find(
      (participant) => participant.user_id === userId,
    )!;
    const secondParticipant = participants.find(
      (participant) => participant.user_id !== userId,
    )!;
    if (participants.length === 1 && firstParticipant) {
      try {
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
      } catch (e) {
        console.log(e);
      }
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
        id: firstParticipant.user_id.toString(),
        login: firstParticipant.user.login,
      },
      firstParticipant.score ?? 0,
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
      firstParticipant,
      secondParticipant,
      gameSession.winner_id,
    );
    const gameSessionStatus = gameSession.winner_id ? 'Finished' : 'Active';

    console.log(
      'alalala',
      GameSessionViewDto.mapToViewDto(
        gameSession,
        firstParticipantProgress,
        secondParticipantProgress,
        sessionQuestions.map(QuestionDto.mapToViewDto),
        gameSessionStatus,
        finishGameDate,
      ),
    );

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
      (participant) => participant.user_id === userId,
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
