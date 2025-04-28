import { SchemaFactory } from '@nestjs/mongoose';
import { CreateUserDomainDto } from './dto/create-user.domain.dto';
import { HydratedDocument, Model } from 'mongoose';

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

export class User {
  id: string;
  login: string;
  email: string;
  passwordHash: string;
  deletedAt: Date | null;
  createdAt?: Date;

  static createInstance(userDto: CreateUserDomainDto): User {
    const user = new User();

    user.login = userDto.login;
    user.email = userDto.email;
    user.passwordHash = userDto.passwordHash;

    return user;
  }

  // makeDeleted() {
  //   if (this.deletedAt !== null) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.BadRequest,
  //       message: 'User already deleted',
  //     });
  //   }
  //   this.deletedAt = new Date();
  // }
  //
  // setEmailConfirmationCode(code: string, expiresInMinutes = 30) {
  //   // this.emailConfirmation.confirmationCode = code;
  //   // this.emailConfirmation.confirmationExpiresAt = new Date(
  //   //   Date.now() + expiresInMinutes * 60 * 1000,
  //   // );
  // }
  // setPasswordRecoveryConfirmationCode(code: string, expiresInMinutes = 30) {
  //   // this.passwordRecoveryConfirmation = {
  //   //   confirmationCode: code,
  //   //   confirmationExpiresAt: new Date(
  //   //     Date.now() + expiresInMinutes * 60 * 1000,
  //   //   ),
  //   // };
  // }
  //
  // isEmailConfirmationValid(code: string): boolean {
  //   return true;
  //   // if (
  //   //   !this.emailConfirmation.confirmationCode ||
  //   //   !this.emailConfirmation.confirmationExpiresAt
  //   // ) {
  //   //   return false;
  //   // }
  //   // return (
  //   //   this.emailConfirmation.confirmationCode === code &&
  //   //   this.emailConfirmation.confirmationExpiresAt > new Date()
  //   // );
  // }
  // isPasswordRecoveryConfirmationValid(): boolean {
  //   return true;
  //   // if (!this.passwordRecoveryConfirmation?.confirmationExpiresAt) {
  //   //   return false;
  //   // }
  //   //
  //   // return this.passwordRecoveryConfirmation.confirmationExpiresAt > new Date();
  // }
  //
  // confirmPasswordRecovery(newPasswordHash: string) {
  //   // this.passwordRecoveryConfirmation = null;
  //   // this.passwordHash = newPasswordHash;
  // }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);

export type UserDocument = HydratedDocument<User>;

export type UserModelType = Model<UserDocument> & typeof User;
