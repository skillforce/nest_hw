import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users.repository';
import { MeViewDto } from '../../api/view-dto/users-view-dto/users.view-dto';

@Injectable()
export class AuthQueryRepository {
  constructor(private readonly usersRepository: UsersRepository) {}

  async Me(userId: string): Promise<MeViewDto> {
    const user = await this.usersRepository.findOrNotFoundFail(userId);

    return MeViewDto.mapToViewDto(user);
  }
}
