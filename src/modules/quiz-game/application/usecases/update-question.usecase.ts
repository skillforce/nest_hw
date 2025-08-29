import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../infrastructure/questions.repository';
import { UpdateQuestionDto } from '../../dto/question.dto';
import {
  CreateQuestionDomainDto,
  UpdateQuestionDomainDto,
} from '../../domain/dto/question-domain.dto';
import { Question } from '../../domain/question.entity';

export class UpdateQuestionCommand {
  constructor(
    public updateQuestionDto: UpdateQuestionDto,
    public questionId: number,
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUsecase
  implements ICommandHandler<UpdateQuestionCommand, void>
{
  constructor(private questionRepository: QuestionsRepository) {}

  async execute({
    updateQuestionDto,
    questionId,
  }: UpdateQuestionCommand): Promise<void> {
    const question =
      await this.questionRepository.findOrNotFoundFail(questionId);

    const updatedQuestion = this.updateInstance(question, updateQuestionDto);

    await this.questionRepository.save(updatedQuestion);
  }

  private updateInstance(
    initQuestion: Question,
    updatedQuestionDto: UpdateQuestionDomainDto,
  ): Question {
    return {
      ...initQuestion,
      questionBody: updatedQuestionDto.body,
      answers: updatedQuestionDto.correctAnswers,
    };
  }
}
