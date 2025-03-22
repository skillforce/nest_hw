import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreateUserDomainDto } from './dto/create-user.domain.dto';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, type: String, min: 3, max: 10, unique: true })
  login: string;

  @Prop({
    required: true,
    type: String,
    unique: true,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  })
  email: string;

  @Prop({ required: true, min: 6, max: 20, type: String })
  passwordHash: string;

  @Prop({ type: Date, nullable: true })
  deletedAt: Date | null;

  createdAt?: Date;
  updatedAt?: Date;

  get id() {
    //@ts-ignore
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
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);

export type UserDocument = HydratedDocument<User>;

export type UserModelType = Model<UserDocument> & typeof User;
