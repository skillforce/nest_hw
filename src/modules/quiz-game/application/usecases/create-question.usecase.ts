import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../infrastructure/questions.repository';
import { CreateQuestionDto } from '../../dto/question.dto';
import { CreateQuestionDomainDto } from '../../domain/dto/question-domain.dto';
import { Question } from '../../domain/question.entity';

export class CreateQuestionCommand {
  constructor(public createQuestionDto: CreateQuestionDto) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUsecase
  implements ICommandHandler<CreateQuestionCommand, number>
{
  constructor(private questionRepository: QuestionsRepository) {}

  async execute({ createQuestionDto }: CreateQuestionCommand): Promise<number> {
    const newQuestion = this.createInstance(createQuestionDto);
    return await this.questionRepository.save(newQuestion);
  }

  private createInstance(questionDto: CreateQuestionDomainDto): Question {
    const question = new Question();

    question.questionBody = questionDto.body;
    question.answers = questionDto.correctAnswers;
    question.isPublished = false;

    return question;
  }
}
