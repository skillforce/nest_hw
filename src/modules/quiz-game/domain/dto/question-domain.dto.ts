export class CreateQuestionDomainDto {
  body: string;
  correctAnswers: string[];
}
export class UpdateQuestionDomainDto {
  body: string;
  correctAnswers: string[];
}
export class UpdateQuestionPublishStatusDomainDto {
  published: boolean;
}
