import { User } from '../../../domain/entities/user.entity';
import { OmitType } from '@nestjs/swagger';

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;

  static mapToViewDto(user: User): UserViewDto {
    const dto = new UserViewDto();

    dto.id = user.id.toString();
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt ?? new Date();
    return dto;
  }
}

export class MeViewDto extends OmitType(UserViewDto, [
  'id',
  'createdAt',
] as const) {
  userId: string;

  static mapToViewDto(user: User): MeViewDto {
    const dto = new MeViewDto();

    dto.userId = user.id.toString();
    dto.login = user.login;
    dto.email = user.email;
    return dto;
  }
}
