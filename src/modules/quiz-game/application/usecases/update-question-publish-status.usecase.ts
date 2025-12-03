import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../infrastructure/questions.repository';
import { UpdateQuestionPublishDto } from '../../dto/question.dto';
import { UpdateQuestionPublishStatusDomainDto } from '../../domain/dto/question-domain.dto';
import { Question } from '../../domain/question.entity';

export class UpdateQuestionPublishStatusCommand {
  constructor(
    public updateQuestionPublishStatusDto: UpdateQuestionPublishDto,
    public questionId: number,
  ) {}
}

@CommandHandler(UpdateQuestionPublishStatusCommand)
export class UpdateQuestionPublishStatusUsecase
  implements ICommandHandler<UpdateQuestionPublishStatusCommand, void>
{
  constructor(private questionRepository: QuestionsRepository) {}

  async execute({
    updateQuestionPublishStatusDto,
    questionId,
  }: UpdateQuestionPublishStatusCommand): Promise<void> {
    const question =
      await this.questionRepository.findOrNotFoundFail(questionId);

    const updatedQuestion = this.updatePublishStatusInstance(
      question,
      updateQuestionPublishStatusDto,
    );

    await this.questionRepository.save(updatedQuestion);
  }

  private updatePublishStatusInstance(
    initQuestion: Question,
    updatedQuestionDto: UpdateQuestionPublishStatusDomainDto,
  ): Question {
    return {
      ...initQuestion,
      updatedAt: new Date(),
      isPublished: updatedQuestionDto.published,
    };
  }
}
