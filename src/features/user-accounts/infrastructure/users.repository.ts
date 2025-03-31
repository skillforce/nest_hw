import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly UserModel: UserModelType,
  ) {}

  async findById(id: string) {
    return this.UserModel.findById({ _id: id, deletedAt: null });
  }
  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  }
  async findByLogin(login: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ login });
  }
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ email });
  }
  async findByEmailOrNotFoundFail(email: string): Promise<UserDocument> {
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            field: 'email',
            message: 'user with such email does not exist',
          },
        ],
        message: 'user not found',
      });
    }

    return user;
  }
  async findByConfirmationCodeOrNotFoundFail(
    confirmationCode: string,
  ): Promise<UserDocument> {
    const user = await this.UserModel.findOne({
      'emailConfirmation.confirmationCode': confirmationCode,
    });
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            field: 'code',
            message: 'code is not valid',
          },
        ],
        message: 'code is not valid',
      });
    }

    return user;
  }
  async findByPasswordRecoveryCodeOrNotFoundFail(passwordRecoveryCode: string) {
    const user = await this.UserModel.findOne({
      'passwordRecoveryConfirmation.confirmationCode': passwordRecoveryCode,
    });
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'recovery code',
            message: 'recovery code is not valid',
          },
        ],
        message: 'recovery code is not valid',
      });
    }

    return user;
  }
  async findOrNotFoundFail(id: string): Promise<UserDocument> {
    const user = await this.findById(id);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'id',
            message: 'user not found',
          },
        ],
        message: 'user not found',
      });
    }

    return user;
  }

  async save(user: UserDocument) {
    return user.save();
  }
}
