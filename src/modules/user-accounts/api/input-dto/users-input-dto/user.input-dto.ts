import { IsFieldExistAndStringWithTrim } from '../../../../../core/decorators/validation/is-field-exist-and-string-with-trim';
import {
  loginConstraints,
  passwordConstraints,
} from '../../../domain/entities/user.entity';
import { IsEmail } from 'class-validator';

export class CreateUserInputDto {
  @IsFieldExistAndStringWithTrim(
    'login',
    loginConstraints.minLength,
    loginConstraints.maxLength,
  )
  login: string;

  @IsFieldExistAndStringWithTrim('email')
  @IsEmail()
  email: string;

  @IsFieldExistAndStringWithTrim(
    'password',
    passwordConstraints.minLength,
    passwordConstraints.maxLength,
  )
  password: string;
}
