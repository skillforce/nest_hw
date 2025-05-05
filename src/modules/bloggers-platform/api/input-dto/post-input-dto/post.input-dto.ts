import { IsFieldExistAndStringWithTrim } from '../../../../../core/decorators/validation/is-field-exist-and-string-with-trim';
import {
  contentConstraints,
  shortDescriptionConstraints,
  titleConstraints,
} from '../../../domain/post.entity';
import { IsMongoId, IsNumber } from 'class-validator';

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

  @IsNumber()
  blogId: number;
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

  @IsNumber()
  blogId: number;
}

export class UpdatePostByBlogIdInputDto {
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
