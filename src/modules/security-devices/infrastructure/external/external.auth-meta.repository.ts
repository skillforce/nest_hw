import { Injectable } from '@nestjs/common';
import { AuthMeta } from '../../domain/auth-meta.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ExternalAuthMetaRepository {
  constructor(
    @InjectRepository(AuthMeta)
    private readonly authMetaOrmRepository: Repository<AuthMeta>,
  ) {}
  async findByDeviceIdAndUserIdAndIatOrNotFoundFail(
    device_id: string,
    user_id: number,
    iat: string,
  ) {
    const session = await this.authMetaOrmRepository.findOne({
      where: {
        userId: user_id,
        deviceId: device_id,
        iat,
      },
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

  async save(session: Omit<AuthMeta, 'id'> & { id?: string }): Promise<string> {
    const result = await this.authMetaOrmRepository.save(session);
    return result.id;
  }
}
