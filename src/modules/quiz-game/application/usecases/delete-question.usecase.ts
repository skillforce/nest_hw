import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../infrastructure/questions.repository';
import { UpdateQuestionDto } from '../../dto/question.dto';
import { UpdateQuestionDomainDto } from '../../domain/dto/question-domain.dto';
import { Question } from '../../domain/question.entity';

export class DeleteQuestionCommand {
  constructor(public questionId: number) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUsecase
  implements ICommandHandler<DeleteQuestionCommand, void>
{
  constructor(private questionRepository: QuestionsRepository) {}

  async execute({ questionId }: DeleteQuestionCommand): Promise<void> {
    const question =
      await this.questionRepository.findOrNotFoundFail(questionId);

    const deletedQuestion = this.markInstanceAsDeleted(question);

    await this.questionRepository.save(deletedQuestion);
  }

  private markInstanceAsDeleted(questionToDelete: Question): Question {
    return {
      ...questionToDelete,
      deletedAt: new Date(),
    };
  }
}
