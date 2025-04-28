import { Injectable } from '@nestjs/common';
import { DevicesViewDto } from '../../api/view-dto/devices.view-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthMeta } from '../../domain/auth-meta.entity';

@Injectable()
export class AuthMetaQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getDevicesForUser(user_id: string): Promise<DevicesViewDto[]> {
    const query = `SELECT * FROM "UserSessions" WHERE "userId" = $1 AND "deletedAt" IS NULL`;
    const sessions = await this.dataSource.query<AuthMeta[]>(query, [user_id]);

    return sessions.map(DevicesViewDto.mapToViewDto);
  }
}
