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

@Module({
  imports: [TypeOrmModule.forFeature([Question])],
  controllers: [QuestionsController],
  providers: [
    QuestionsRepository,
    QuestionsQueryRepository,
    CreateQuestionUsecase,
    UpdateQuestionUsecase,
    DeleteQuestionUsecase,
    UpdateQuestionPublishStatusUsecase,
  ],
  exports: [],
})
export class QuizGameModule {}
