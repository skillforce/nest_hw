import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreateUserDomainDto } from './dto/create-user.domain.dto';
import { HydratedDocument, Model } from 'mongoose';
import {
  EmailConfirmation,
  EmailConfirmationSchema,
} from './schemas/email-confirmation.schema';
import {
  PasswordRecoveryConfirmation,
  PasswordRecoveryConfirmationSchema,
} from './schemas/password-recovery-confirmation.schema';

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, type: String, unique: true, ...loginConstraints })
  login: string;

  @Prop({
    required: true,
    type: String,
    unique: true,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  })
  email: string;

  @Prop({ required: true, type: String })
  passwordHash: string;

  @Prop({
    type: EmailConfirmationSchema,
    default: {
      isConfirmed: false,
    },
  })
  emailConfirmation: EmailConfirmation;

  @Prop({
    type: PasswordRecoveryConfirmationSchema,
    default: null,
    nullable: true,
  })
  passwordRecoveryConfirmation: PasswordRecoveryConfirmation | null;

  @Prop({ type: Date, nullable: true, default: null })
  deletedAt: Date | null;

  createdAt?: Date;
  updatedAt?: Date;

  get id() {
    //@ts-ignore
    //eslint-disable-next-line
    return this._id.toString();
  }

  static createInstance(userDto: CreateUserDomainDto): UserDocument {
    const user = new this() as UserDocument;

    user.login = userDto.login;
    user.email = userDto.email;
    user.passwordHash = userDto.passwordHash;

    return user;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('User already deleted');
    }
    this.deletedAt = new Date();
  }

  setEmailConfirmationCode(code: string, expiresInMinutes = 30) {
    this.emailConfirmation.confirmationCode = code;
    this.emailConfirmation.confirmationExpiresAt = new Date(
      Date.now() + expiresInMinutes * 60 * 1000,
    );
  }
  setPasswordRecoveryConfirmationCode(code: string, expiresInMinutes = 30) {
    this.passwordRecoveryConfirmation = {
      confirmationCode: code,
      confirmationExpiresAt: new Date(
        Date.now() + expiresInMinutes * 60 * 1000,
      ),
    };
  }

  isEmailConfirmationValid(code: string): boolean {
    if (
      !this.emailConfirmation.confirmationCode ||
      !this.emailConfirmation.confirmationExpiresAt
    ) {
      return false;
    }

    return (
      this.emailConfirmation.confirmationCode === code &&
      this.emailConfirmation.confirmationExpiresAt > new Date()
    );
  }
  isPasswordRecoveryConfirmationValid(): boolean {
    if (!this.passwordRecoveryConfirmation?.confirmationExpiresAt) {
      return false;
    }

    return this.passwordRecoveryConfirmation.confirmationExpiresAt > new Date();
  }

  confirmRegistration() {
    this.emailConfirmation.isConfirmed = true;
    this.emailConfirmation.confirmationCode = null;
    this.emailConfirmation.confirmationExpiresAt = null;
  }
  confirmPasswordRecovery(newPasswordHash: string) {
    this.passwordRecoveryConfirmation = null;
    this.passwordHash = newPasswordHash;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);

export type UserDocument = HydratedDocument<User>;

export type UserModelType = Model<UserDocument> & typeof User;
