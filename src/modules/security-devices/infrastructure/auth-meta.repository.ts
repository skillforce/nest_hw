import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { AuthMeta } from '../domain/auth-meta.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class AuthMetaRepository {
  constructor(
    @InjectRepository(AuthMeta)
    private readonly authMetaOrmRepository: Repository<AuthMeta>,
  ) {}
  async findManyByDeviceIdOrNotFoundFail(device_id: string) {
    const sessions = await this.authMetaOrmRepository.find({
      where: { deviceId: device_id },
    });

    if (!sessions.length) {
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
    user_id: number,
    device_id: string,
  ): Promise<void> {
    await this.authMetaOrmRepository.update(
      {
        userId: user_id,
        deviceId: Not(device_id),
        deletedAt: IsNull(),
      },
      {
        deletedAt: new Date().toISOString(),
      },
    );
  }

  async save(session: Omit<AuthMeta, 'id'> & { id?: string }): Promise<string> {
    const result = await this.authMetaOrmRepository.save(session);

    return result.id;
  }
}
