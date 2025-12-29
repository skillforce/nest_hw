import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GameSessionParticipantsRepository } from '../../infrastructure/game-session-participants.repository';
import { GameSessionQuestionsRepository } from '../../infrastructure/game-session-questions.repository';
import { GameSessionsRepository } from '../../infrastructure/game_session.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { GameSessionParticipants } from '../../domain/game-session-participants.entity';
import { GameSession } from '../../domain/game-session.entity';
import { QuestionsRepository } from '../../infrastructure/questions.repository';

export class ConnectUserToTheQuizGameCommand {
  constructor(public userId: number) {}
}

@CommandHandler(ConnectUserToTheQuizGameCommand)
export class ConnectUserToTheQuizGameUsecase
  implements ICommandHandler<ConnectUserToTheQuizGameCommand, number>
{
  constructor(
    private gameSessionParticipantsRepository: GameSessionParticipantsRepository,
    private gameSessionsRepository: GameSessionsRepository,
    private gameSessionsQuestionsRepository: GameSessionQuestionsRepository,
    private questionsRepository: QuestionsRepository,
  ) {}

  async execute({ userId }: ConnectUserToTheQuizGameCommand): Promise<number> {
    const activeGameSession =
      await this.gameSessionsRepository.findActiveGameSessionByUserId(userId);

    if (activeGameSession) {
      console.log('ACTIVE GAME SESSION FOUND:', activeGameSession);
      console.log('ACTIVE GAME SESSION FOUND:', userId);
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        extensions: [
          {
            field: 'user is already in the game1',
            message: 'user is already in the game',
          },
        ],
        message: 'user is already in the game',
      });
    }
    const secondUserPendingGameSession =
      await this.gameSessionsRepository.findPendingSecondUserGameSession();

    if (secondUserPendingGameSession?.creator_user_id === userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        extensions: [
          {
            field: 'user is already in the game2',
            message: 'user is already in the game',
          },
        ],
        message: 'user is already in the game',
      });
    }
    if (secondUserPendingGameSession) {
      await this.connectUserToExistingGameSession(
        secondUserPendingGameSession,
        userId,
      );
      return secondUserPendingGameSession.id;
    }
    return await this.createGameSession(userId);
  }
  private async createGameSession(userId: number) {
    const gameSession = { ...new GameSession(), creator_user_id: userId };
    const newGameSessionId =
      await this.gameSessionsRepository.save(gameSession);
    await this.createGameSessionParticipant(newGameSessionId, userId);
    return newGameSessionId;
  }
  private async connectUserToExistingGameSession(
    gameSession: GameSession,
    userId: number,
  ) {
    try {
      await this.createGameSessionParticipant(gameSession.id, userId);

      const questionsArrayForNewGameSession =
        await this.questionsRepository.getFiveRandomQuestions();
      if (questionsArrayForNewGameSession.length !== 5) {
        throw new DomainException({
          code: DomainExceptionCode.BadRequest,
          message: 'Some issues occurred while generate questions',
        });
      }
      await this.gameSessionsQuestionsRepository.attachQuestionsToSession(
        gameSession.id,
        questionsArrayForNewGameSession,
      );
      const startedGameSession = {
        ...gameSession,
        session_started_at: new Date(),
      };

      await this.gameSessionsRepository.save(startedGameSession);
    } catch (e) {
      console.log(e);
    }
  }
  private async createGameSessionParticipant(
    sessionId: number,
    userId: number,
  ) {
    try {
      const gameSessionParticipant = new GameSessionParticipants();
      gameSessionParticipant.game_session_id = sessionId;
      gameSessionParticipant.user_id = userId;
      await this.gameSessionParticipantsRepository.save(gameSessionParticipant);
    } catch (e) {
      console.log(e);
    }
  }
}
