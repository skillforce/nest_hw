import { IsFieldExistAndStringWithTrim } from '../../../../../core/decorators/validation/is-field-exist-and-string-with-trim';
import {
  contentConstraints,
  shortDescriptionConstraints,
  titleConstraints,
} from '../../../domain/post.entity';
import { IsMongoId } from 'class-validator';

export class CreatePostInputDto {
  @IsFieldExistAndStringWithTrim(
    'title',
    titleConstraints.minLength,
    titleConstraints.maxLength,
  )
  title: string;

  @IsFieldExistAndStringWithTrim(
    'shortDescription',
    shortDescriptionConstraints.minLength,
    shortDescriptionConstraints.maxLength,
  )
  shortDescription: string;
  @IsFieldExistAndStringWithTrim(
    'content',
    contentConstraints.minLength,
    contentConstraints.maxLength,
  )
  content: string;

  @IsFieldExistAndStringWithTrim('blogId')
  blogId: string;
}

export class CreatePostByBlogIdInputDto {
  @IsFieldExistAndStringWithTrim(
    'title',
    titleConstraints.minLength,
    titleConstraints.maxLength,
  )
  title: string;
  @IsFieldExistAndStringWithTrim(
    'shortDescription',
    shortDescriptionConstraints.minLength,
    shortDescriptionConstraints.maxLength,
  )
  shortDescription: string;
  @IsFieldExistAndStringWithTrim(
    'content',
    contentConstraints.minLength,
    contentConstraints.maxLength,
  )
  content: string;
}

export class UpdatePostInputDto {
  @IsFieldExistAndStringWithTrim(
    'title',
    titleConstraints.minLength,
    titleConstraints.maxLength,
  )
  title: string;
  @IsFieldExistAndStringWithTrim(
    'shortDescription',
    shortDescriptionConstraints.minLength,
    shortDescriptionConstraints.maxLength,
  )
  shortDescription: string;
  @IsFieldExistAndStringWithTrim(
    'content',
    contentConstraints.minLength,
    contentConstraints.maxLength,
  )
  content: string;

  @IsFieldExistAndStringWithTrim('blogId')
  @IsMongoId()
  blogId: string;
}
