import { AuthMeta } from '../../domain/auth-meta.entity';

export class DevicesViewDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToViewDto(user: AuthMeta): DevicesViewDto {
    const dto = new DevicesViewDto();

    dto.ip = user.ipAddress;
    dto.title = user.deviceName;
    dto.lastActiveDate = user.iat;
    dto.deviceId = user.deviceId;
    return dto;
  }
}
