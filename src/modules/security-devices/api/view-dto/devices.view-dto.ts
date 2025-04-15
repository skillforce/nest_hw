import { AuthMetaDocument } from '../../domain/auth-meta.entity';

export class DevicesViewDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToViewDto(user: AuthMetaDocument): DevicesViewDto {
    const dto = new DevicesViewDto();

    dto.ip = user.ip_address;
    dto.title = user.device_name;
    dto.lastActiveDate = user.iat;
    dto.deviceId = user.device_id;
    return dto;
  }
}
