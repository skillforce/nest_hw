import { IsEmail, IsUUID, Length } from 'class-validator';
import {
  loginConstraints,
  passwordConstraints,
} from '../../../domain/entities/user.entity';
import { IsFieldExistAndStringWithTrim } from '../../../../../core/decorators/validation/is-field-exist-and-string-with-trim';

export class LoginInputDto {
  @IsFieldExistAndStringWithTrim('loginOrEmail')
  loginOrEmail: string;

  @IsFieldExistAndStringWithTrim('password')
  password: string;
}

export class PasswordRecoveryInputDto {
  @IsFieldExistAndStringWithTrim('email')
  @IsEmail()
  email: string;
}
export class NewPasswordInputDto {
  @IsFieldExistAndStringWithTrim(
    'newPassword',
    passwordConstraints.minLength,
    passwordConstraints.maxLength,
  )
  newPassword: string;

  @IsFieldExistAndStringWithTrim('recoveryCode')
  @IsUUID()
  recoveryCode: string;
}

export class RegistrationConfirmationInputDto {
  @IsFieldExistAndStringWithTrim('code')
  @IsUUID()
  code: string;
}

export class RegistrationInputDto {
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
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  password: string;
}

export class RegistrationResendingInputDto {
  @IsFieldExistAndStringWithTrim('email')
  @IsEmail()
  email: string;
}
