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
}
