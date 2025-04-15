import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  AuthMeta,
  AuthMetaDocument,
  AuthMetaModelType,
} from '../../domain/auth-meta.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class ExternalAuthMetaRepository {
  constructor(
    @InjectModel(AuthMeta.name)
    private readonly AuthMetaModel: AuthMetaModelType,
  ) {}
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
