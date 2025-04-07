import { IsFieldExistAndStringWithTrim } from '../../../../../core/decorators/validation/is-field-exist-and-string-with-trim';
import {
  blogDescriptionConstraint,
  blogNameConstraint,
  blogUrlConstraint,
} from '../../../domain/blog.entity';

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
    'description',
    blogUrlConstraint.minLength,
    blogUrlConstraint.maxLength,
  )
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
    'description',
    blogUrlConstraint.minLength,
    blogUrlConstraint.maxLength,
  )
  websiteUrl: string;
}
