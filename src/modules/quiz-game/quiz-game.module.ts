import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsRepository } from './infrastructure/questions.repository';
import { QuestionsQueryRepository } from './infrastructure/query/questions.query-repository';
import { CreateQuestionUsecase } from './application/usecases/create-question.usecase';
import { UpdateQuestionUsecase } from './application/usecases/update-question.usecase';
import { DeleteQuestionUsecase } from './application/usecases/delete-question.usecase';
import { UpdateQuestionPublishStatusUsecase } from './application/usecases/update-question-publish-status.usecase';
import { QuestionsController } from './api/questions_controller';
import { Question } from './domain/question.entity';
import { GameSession } from './domain/game-session.entity';
import { GameSessionParticipants } from './domain/game-session-participants.entity';
import { GameSessionQuestionAnswer } from './domain/game-session-question-answers.entity';
import { GameSessionQuestion } from './domain/game-session-questions.entity';
import { GameSessionParticipantsRepository } from './infrastructure/game-session-participants.repository';
import { GameSessionQuestionAnswerRepository } from './infrastructure/game-session-question-answer.repository';
import { GameSessionQuestionsRepository } from './infrastructure/game-session-questions.repository';
import { GameSessionsRepository } from './infrastructure/game_session.repository';
import { AnswerQuestionUsecase } from './application/usecases/answer-quiz-game-question.usecase';
import { ConnectUserToTheQuizGameUsecase } from './application/usecases/connect-user-to-the-quiz-game.usecase';
import { GetGameSessionByIdUsecase } from './application/usecases/get-game-session-by-id.usecase';
import { GetMyCurrentPairUsecase } from './application/usecases/get-my-current-pair.usecase';
import { QuizGameController } from './api/quiz-game_controller';
import { GetMyStatisticUsecase } from './application/usecases/get-my-statistic.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Question,
      GameSession,
      GameSessionParticipants,
      GameSessionQuestionAnswer,
      GameSessionQuestion,
    ]),
  ],
  controllers: [QuestionsController, QuizGameController],
  providers: [
    QuestionsRepository,
    QuestionsQueryRepository,
    CreateQuestionUsecase,
    UpdateQuestionUsecase,
    DeleteQuestionUsecase,
    AnswerQuestionUsecase,
    GetMyStatisticUsecase,
    ConnectUserToTheQuizGameUsecase,
    GetGameSessionByIdUsecase,
    GetMyCurrentPairUsecase,
    UpdateQuestionPublishStatusUsecase,
    GameSessionParticipantsRepository,
    GameSessionQuestionAnswerRepository,
    GameSessionQuestionsRepository,
    GameSessionsRepository,
  ],
  exports: [],
})
export class QuizGameModule {}
