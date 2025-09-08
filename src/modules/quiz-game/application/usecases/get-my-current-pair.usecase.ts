import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  GameSessionViewDto,
  PlayerProgressDto,
  QuestionDto,
} from '../../api/dto/game-session-view-dto';
import { GameSessionParticipantsRepository } from '../../infrastructure/game-session-participants.repository';
import { GameSessionQuestionsRepository } from '../../infrastructure/game-session-questions.repository';
import { GameSessionsRepository } from '../../infrastructure/game_session.repository';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import { GameSession } from '../../domain/game-session.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { GameSessionQuestion } from '../../domain/game-session-questions.entity';
import { GameSessionQuestionAnswerRepository } from '../../infrastructure/game-session-question-answer.repository';
import { GameSessionParticipants } from '../../domain/game-session-participants.entity';

export class GetMyCurrentPairCommand {
  constructor(public userId: number) {}
}

@CommandHandler(GetMyCurrentPairCommand)
export class GetMyCurrentPairUsecase
  implements
    ICommandHandler<GetMyCurrentPairCommand, Promise<GameSessionViewDto>>
{
  constructor(
    private gameSessionParticipantsRepository: GameSessionParticipantsRepository,
    private gameSessionsRepository: GameSessionsRepository,
    private gameSessionsQuestionsRepository: GameSessionQuestionsRepository,
    private gameSessionsQuestionsAnswersRepository: GameSessionQuestionAnswerRepository,
    private usersRepository: UsersRepository,
    private requiredQuestionArrayLength = 5,
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

    this.checkIfGameSessionActive(gameSession);

    const secondParticipant =
      await this.gameSessionParticipantsRepository.findSecondParticipantByGameSessionIdOrNotFoundFail(
        activeParticipant.game_session_id,
        userId,
      );

    const sessionQuestions =
      await this.gameSessionsQuestionsRepository.findByGameSessionId(
        gameSession.id,
      );
    this.checkIfEnoughQuestions(sessionQuestions);

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
        id: activeParticipant.id.toString(),
        login: activeParticipant.user.login,
      },
      activeParticipant.score,
    );
    const secondParticipantProgress = PlayerProgressDto.mapToViewDto(
      secondParticipantAnswers,
      {
        id: secondParticipant.id.toString(),
        login: secondParticipant.user.login,
      },
      secondParticipant.score,
    );

    const finishGameDate = gameSession.winner_id
      ? this.getFinishGameDate(
          activeParticipant,
          secondParticipant,
          gameSession.winner_id,
        )
      : null;

    return GameSessionViewDto.mapToViewDto(
      gameSession,
      firstParticipantProgress,
      secondParticipantProgress,
      sessionQuestions.map(QuestionDto.mapToViewDto),
      'Active', // -----???????????
      finishGameDate,
    );
  }

  private checkIfGameSessionActive(gameSession: GameSession) {
    if (!gameSession.session_started_at)
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
  private checkIfEnoughQuestions(sessionQuestionsArray: GameSessionQuestion[]) {
    if (sessionQuestionsArray.length !== this.requiredQuestionArrayLength)
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

  private getFinishGameDate(
    firstParticipant: GameSessionParticipants,
    secondParticipant: GameSessionParticipants,
    winnerId: string,
  ) {
    if (firstParticipant.user.id === +winnerId) {
      return firstParticipant.finished_at.toString();
    }
    return firstParticipant.finished_at.toString();
  }
}
