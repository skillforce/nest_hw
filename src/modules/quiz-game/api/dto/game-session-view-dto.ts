import { AnswerStatus } from '../../domain/game-session-question-answers.entity';
import { GameSession } from '../../domain/game-session.entity';

export class AnswerDto {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: string;
}

export class PlayerDto {
  id: string;
  login: string;
}

export class PlayerProgressDto {
  answers: AnswerDto[];
  player: PlayerDto;
  score: number;
}

export class QuestionDto {
  id: string;
  body: string;
}

export type GameStatus = 'Pending' | 'Active' | 'Finished';

export class GameSessionViewDto {
  id: string;
  firstPlayerProgress: PlayerProgressDto;
  secondPlayerProgress: PlayerProgressDto;
  questions: QuestionDto[];
  status: GameStatus;
  pairCreatedDate: string;
  startGameDate: string;
  finishGameDate: string;

  static mapToViewDto(gameSession: GameSession): GameSessionViewDto {
    const dto = new GameSessionViewDto();

    dto.id = gameSession.id.toString();
    // dto.firstPlayerProgress = gameSession.firstPlayerProgress;
    // dto.secondPlayerProgress = gameSession.secondPlayerProgress;
    // dto.questions = gameSession.questions;
    // dto.status = gameSession.status;
    // dto.pairCreatedDate = gameSession.;
    // dto.startGameDate = gameSession.startGameDate;
    // dto.finishGameDate = gameSession.finishGameDate;

    return dto;
  }
}

export class AnswerQuestionViewDto {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: string;
}
