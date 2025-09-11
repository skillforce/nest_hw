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
  ) {}

  async execute({
    userId,
  }: ConnectUserToTheQuizGameCommand): Promise<GameSessionViewDto> {
    const gameSession =
      await this.gameSessionsRepository.findActiveGameSessionByUserId(userId);
    if (gameSession) {
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
  }
}
