export class UserDto {
  login: string;
  email: string;
  password: string;
}

export class UpdateUserPasswordDto {
  recoveryCode: string;
  newPassword: string;
}
