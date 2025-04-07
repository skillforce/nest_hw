import { CommentContentConstraints } from '../../../domain/comment.entity';
import { IsFieldExistAndStringWithTrim } from '../../../../../core/decorators/validation/is-field-exist-and-string-with-trim';

export class CreateCommentInputDto {
  @IsFieldExistAndStringWithTrim(
    'content',
    CommentContentConstraints.minLength,
    CommentContentConstraints.maxLength,
  )
  content: string;
}
export class UpdateCommentInputDto {
  @IsFieldExistAndStringWithTrim(
    'content',
    CommentContentConstraints.minLength,
    CommentContentConstraints.maxLength,
  )
  content: string;
}
