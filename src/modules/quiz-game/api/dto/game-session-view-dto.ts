import {
  AnswerStatus,
  GameSessionQuestionAnswer,
} from '../../domain/game-session-question-answers.entity';
import { GameSession } from '../../domain/game-session.entity';
import { GameSessionQuestion } from '../../domain/game-session-questions.entity';

export class AnswerDto {
  questionId: number;
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

  static mapToViewDto(
    answers: GameSessionQuestionAnswer[],
    playerDto: PlayerDto,
    score: number,
  ): PlayerProgressDto {
    const dto = new PlayerProgressDto();

    dto.answers = answers.length
      ? answers.map((answer) => {
          return {
            addedAt: answer.createdAt?.toString() || new Date().toISOString(),
            answerStatus: answer.answer_status,
            questionId: answer.gameSessionQuestion.question_id,
          };
        })
      : [];
    dto.player = playerDto;
    dto.score = score;
    return dto;
  }
}

export class QuestionDto {
  id: string;
  body: string;

  static mapToViewDto(gameSessionQuestion: GameSessionQuestion): QuestionDto {
    const dto = new QuestionDto();
    dto.id = gameSessionQuestion.id.toString();
    dto.body = gameSessionQuestion.question.questionBody;
    return dto;
  }
}

export type GameStatus = 'PendingSecondPlayer' | 'Active' | 'Finished';

export class GameSessionViewDto {
  id: string;
  firstPlayerProgress: PlayerProgressDto;
  secondPlayerProgress: PlayerProgressDto | null;
  questions: QuestionDto[] | null;
  status: GameStatus;
  pairCreatedDate: string;
  startGameDate: string | null;
  finishGameDate: string | null;

  static mapToViewDto(
    gameSession: GameSession,
    firstPlayerProgress: PlayerProgressDto,
    secondPlayerProgress: PlayerProgressDto | null,
    questions: QuestionDto[] | null,
    status: GameStatus,
    finishGameDate: string | null,
  ): GameSessionViewDto {
    const dto = new GameSessionViewDto();
    const progresses = [firstPlayerProgress, secondPlayerProgress].filter(
      Boolean,
    ) as PlayerProgressDto[];

    const creatorId = gameSession.creator_user_id.toString();

    const creatorProgress =
      progresses.find((p) => p.player.id === creatorId) ?? firstPlayerProgress;

    const participantProgress =
      progresses.length === 1
        ? null
        : (progresses.find(
            (p) => p.player.id !== creatorId,
          ) as PlayerProgressDto);

    dto.id = gameSession.id.toString();
    dto.firstPlayerProgress = creatorProgress;
    dto.secondPlayerProgress = participantProgress;
    dto.questions = questions;
    dto.status = status;
    dto.pairCreatedDate =
      gameSession.createdAt?.toISOString() || new Date().toISOString();
    dto.startGameDate = gameSession.session_started_at?.toISOString() || null;
    dto.finishGameDate = finishGameDate;
    return dto;
  }
}

export class AnswerQuestionViewDto {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: string;

  static mapToViewDto(
    answer: GameSessionQuestionAnswer,
    questionId: number,
  ): AnswerQuestionViewDto {
    return {
      questionId: questionId.toString(),
      answerStatus: answer.answer_status,
      addedAt: answer.createdAt?.toString() || new Date().toISOString(),
    };
  }
}
