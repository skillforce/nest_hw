import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameSessionViewDto } from '../../api/dto/game-session-view-dto';
import { GameSessionParticipantsRepository } from '../../infrastructure/game-session-participants.repository';
import { GameSessionQuestionsRepository } from '../../infrastructure/game-session-questions.repository';
import { GameSessionsRepository } from '../../infrastructure/game_session.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { GameSessionQuestionAnswerRepository } from '../../infrastructure/game-session-question-answer.repository';
import { GameSessionParticipants } from '../../domain/game-session-participants.entity';
import { GameSession } from '../../domain/game-session.entity';
import { QuestionsRepository } from '../../infrastructure/questions.repository';

export class ConnectUserToTheQuizGameCommand {
  constructor(public userId: number) {}
}

@CommandHandler(ConnectUserToTheQuizGameCommand)
export class ConnectUserToTheQuizGameUsecase
  implements
    ICommandHandler<ConnectUserToTheQuizGameCommand, GameSessionViewDto>
{
  constructor(
    private gameSessionParticipantsRepository: GameSessionParticipantsRepository,
    private gameSessionsRepository: GameSessionsRepository,
    private gameSessionsQuestionsRepository: GameSessionQuestionsRepository,
    private gameSessionsQuestionsAnswersRepository: GameSessionQuestionAnswerRepository,
    private questionsRepository: QuestionsRepository,
  ) {}

  async execute({
    userId,
  }: ConnectUserToTheQuizGameCommand): Promise<GameSessionViewDto> {
    const activeGameSession =
      await this.gameSessionsRepository.findActiveGameSessionByUserId(userId);
    if (activeGameSession) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        extensions: [
          {
            field: 'user is already in the game',
            message: 'user is already in the game',
          },
        ],
        message: 'user is already in the game',
      });
    }
    const secondUserPendingGameSession =
      await this.gameSessionsRepository.findPendingSecondUserGameSession();
    if (secondUserPendingGameSession) {
      await this.connectUserToExistingGameSession(
        secondUserPendingGameSession,
        userId,
      );
      return this.getGameSessionViewDto(secondUserPendingGameSession.id, false);
    }
    const newGameSessionId = await this.createGameSession(userId);
    return this.getGameSessionViewDto(newGameSessionId, true);
  }
  private async createGameSession(userId: number) {
    const gameSession = new GameSession();
    const newGameSessionId =
      await this.gameSessionsRepository.save(gameSession);
    await this.createGameSessionParticipant(newGameSessionId, userId);

    const questionsArrayForNewGameSession =
      await this.questionsRepository.getFiveRandomQuestions();
    if (questionsArrayForNewGameSession.length !== 5) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Some issues occurred while generate questions',
      });
    }
    await this.gameSessionsQuestionsRepository.attachQuestionsToSession(
      newGameSessionId,
      questionsArrayForNewGameSession,
    );
    return newGameSessionId;
  }
  private async connectUserToExistingGameSession(
    gameSession: GameSession,
    userId: number,
  ) {
    await this.createGameSessionParticipant(gameSession.id, userId);
    const startedGameSession = {
      ...gameSession,
      session_started_at: new Date(),
    };
    await this.gameSessionsRepository.save(startedGameSession);
  }
  private async createGameSessionParticipant(
    sessionId: number,
    userId: number,
  ) {
    const gameSessionParticipant = new GameSessionParticipants();
    gameSessionParticipant.game_session_id = sessionId;
    gameSessionParticipant.user_id = userId;
    await this.gameSessionParticipantsRepository.save(gameSessionParticipant);
  }
  private async getGameSessionViewDto(
    gameSessionId: number,
    isPendingSecondUser: boolean,
  ): Promise<GameSessionViewDto> {
    // const gameSessionViewDto = GameSessionViewDto.mapToViewDto(gameSession);
    return;
  }
}

// TODO: should return GameSessionViewDto
