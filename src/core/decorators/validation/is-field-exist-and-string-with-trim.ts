import { applyDecorators } from '@nestjs/common';
import { IsString, Length } from 'class-validator';
import { Trim } from '../transform/trim';
import { FieldExists } from './isExist';

export const IsFieldExistAndStringWithTrim = (
  fieldName: string,
  minLength?: number,
  maxLength?: number,
) =>
  applyDecorators(
    FieldExists(fieldName),
    IsString(),
    Length(minLength ?? 0, maxLength),
    Trim(),
  );
