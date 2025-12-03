import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { IsFieldExistAndStringWithTrim } from '../../../../core/decorators/validation/is-field-exist-and-string-with-trim';
import { questionBodyConstraint } from '../../domain/question.entity';
import { ArrayMinSize, IsArray, IsBoolean, IsString } from 'class-validator';

export enum QuestionsSortBy {
  CreatedAt = 'createdAt',
  Body = 'body',
}

export class GetQuestionsQueryParams extends BaseQueryParams {
  sortBy: QuestionsSortBy;
  bodySearchTerm: string | null;
  publishedStatus: boolean | null;

  constructor() {
    super();
    this.sortBy = QuestionsSortBy.CreatedAt;
    this.bodySearchTerm = null;
    this.publishedStatus = null;
  }
}

export class CreateQuestionInputDto {
  @IsFieldExistAndStringWithTrim(
    'body',
    questionBodyConstraint.minLength,
    questionBodyConstraint.maxLength,
  )
  body: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  correctAnswers: string[];
}

export class UpdateQuestionByIdInputDto {
  @IsFieldExistAndStringWithTrim(
    'body',
    questionBodyConstraint.minLength,
    questionBodyConstraint.maxLength,
  )
  body: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  correctAnswers: string[];
}
export class PublishQuestionByIdInputDto {
  @IsBoolean()
  published: boolean;
}
