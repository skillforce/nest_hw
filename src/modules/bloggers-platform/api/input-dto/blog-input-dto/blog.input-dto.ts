import { IsFieldExistAndStringWithTrim } from '../../../../../core/decorators/validation/is-field-exist-and-string-with-trim';
import {
  blogDescriptionConstraint,
  blogNameConstraint,
  blogUrlConstraint,
} from '../../../domain/blog.entity';
import { Matches } from 'class-validator';

export class CreateBlogInputDto {
  @IsFieldExistAndStringWithTrim(
    'name',
    blogNameConstraint.minLength,
    blogNameConstraint.maxLength,
  )
  name: string;

  @IsFieldExistAndStringWithTrim(
    'description',
    blogDescriptionConstraint.minLength,
    blogDescriptionConstraint.maxLength,
  )
  description: string;

  @IsFieldExistAndStringWithTrim(
    'websiteUrl',
    blogUrlConstraint.minLength,
    blogUrlConstraint.maxLength,
  )
  @Matches(blogUrlConstraint.pattern)
  websiteUrl: string;
}

export class UpdateBlogInputDto {
  @IsFieldExistAndStringWithTrim(
    'name',
    blogNameConstraint.minLength,
    blogNameConstraint.maxLength,
  )
  name: string;

  @IsFieldExistAndStringWithTrim(
    'description',
    blogDescriptionConstraint.minLength,
    blogDescriptionConstraint.maxLength,
  )
  description: string;

  @IsFieldExistAndStringWithTrim(
    'websiteUrl',
    blogUrlConstraint.minLength,
    blogUrlConstraint.maxLength,
  )
  @Matches(blogUrlConstraint.pattern)
  websiteUrl: string;
}
