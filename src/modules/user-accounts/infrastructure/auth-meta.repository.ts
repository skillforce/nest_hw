import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from '../domain/user.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import {
  AuthMeta,
  AuthMetaDocument,
  AuthMetaModelType,
} from '../domain/auth-meta.entity';

@Injectable()
export class AuthMetaRepository {
  constructor(
    @InjectModel(AuthMeta.name)
    private readonly AuthMetaModel: AuthMetaModelType,
  ) {}

  async findById(id: string) {
    return this.AuthMetaModel.findOne({ _id: id, deletedAt: null });
  }
  async findByDeviceIdAndUserIdAndIatOrNotFoundFail(
    device_id: string,
    user_id: string,
    iat: string,
  ) {
    const session = await this.AuthMetaModel.findOne({
      device_id,
      user_id,
      iat,
      deletedAt: null,
    });
    if (!session) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        extensions: [
          {
            field: 'session',
            message: 'session does not exist',
          },
        ],
        message: 'session not found',
      });
    }

    return session;
  }

  async save(session: AuthMetaDocument) {
    return session.save();
  }
}
