import { Injectable } from '@nestjs/common';
import { AuthMeta, AuthMetaModelType } from '../../domain/auth-meta.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DevicesViewDto } from '../../api/view-dto/devices.view-dto';

@Injectable()
export class AuthMetaQueryRepository {
  constructor(
    @InjectModel(AuthMeta.name)
    private readonly AuthMetaModel: AuthMetaModelType,
  ) {}

  async getDevicesForUser(user_id: string): Promise<DevicesViewDto[]> {
    const sessions = await this.AuthMetaModel.find({
      user_id,
      deletedAt: null,
    });

    return sessions.map(DevicesViewDto.mapToViewDto);
  }
}
