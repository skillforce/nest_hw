import { Question } from '../../domain/question.entity';

export class QuestionViewDto {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;

  static mapToViewDto(question: Question): QuestionViewDto {
    const dto = new QuestionViewDto();

    dto.id = question.id.toString();
    dto.body = question.questionBody;
    dto.correctAnswers = question.answers;
    dto.updatedAt = question.updatedAt || new Date();
    dto.createdAt = question.createdAt || new Date();
    dto.published = question.isPublished;

    return dto;
  }
}
