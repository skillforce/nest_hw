import { Injectable } from '@nestjs/common';
import { DevicesViewDto } from '../../api/view-dto/devices.view-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { AuthMeta } from '../../domain/auth-meta.entity';

@Injectable()
export class AuthMetaQueryRepository {
  constructor(
    @InjectRepository(AuthMeta)
    private readonly authMetaOrmRepository: Repository<AuthMeta>,
  ) {}

  async getDevicesForUser(user_id: number): Promise<DevicesViewDto[]> {
    const sessions = await this.authMetaOrmRepository.find({
      where: { userId: user_id, deletedAt: IsNull() },
    });

    return sessions.map(DevicesViewDto.mapToViewDto);
  }
}
