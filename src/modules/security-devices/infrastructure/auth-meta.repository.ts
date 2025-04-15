import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
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
  async findManyByDeviceIdOrNotFoundFail(device_id: string) {
    const sessions = await this.AuthMetaModel.find({
      device_id,
      deletedAt: null,
    });
    if (!sessions) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'refreshToken',
            message: 'session does not exist',
          },
        ],
        message: 'session not found',
      });
    }

    return sessions;
  }
  async markAllSessionsAsDeletedExceptWithDeviceId(
    user_id: string,
    device_id: string,
  ) {
    const deletedAt = new Date().toISOString();

    return this.AuthMetaModel.updateMany(
      {
        user_id,
        deletedAt: null,
        device_id: { $ne: device_id },
      },
      {
        $set: { deletedAt },
      },
    );
  }

  async save(session: AuthMetaDocument) {
    return session.save();
  }
}
