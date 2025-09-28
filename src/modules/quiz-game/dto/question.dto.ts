export class CreateQuestionDto {
  body: string;
  correctAnswers: string[];
}

export class UpdateQuestionDto {
  body: string;
  correctAnswers: string[];
}
export class UpdateQuestionPublishDto {
  published: boolean;
}

export class AnswerQuestionDto {
  answer: string;
}
