import { Question } from '../../domain/question.entity';

export class QuestionViewDto {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;

  static mapToViewDto(question: Question): QuestionViewDto {
    const dto = new QuestionViewDto();

    dto.id = question.id.toString();
    dto.body = question.questionBody;
    dto.correctAnswers = question.answers;
    dto.updatedAt = question.updatedAt ?? null;
    dto.createdAt = question.createdAt ?? null;
    dto.published = question.isPublished;

    return dto;
  }
}
