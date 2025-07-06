import { Injectable } from '@nestjs/common';
import { MeViewDto } from '../../api/view-dto/users-view-dto/users.view-dto';
import { User } from '../../domain/entities/user.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class AuthQueryRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersOrmRepository: Repository<User>,
  ) {}

  async getMe(userId: number): Promise<MeViewDto> {
    const userResult = await this.usersOrmRepository.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });
    if (!userResult) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            field: 'user',
            message: 'user with such id does not exist',
          },
        ],
        message: 'user not found',
      });
    }

    return MeViewDto.mapToViewDto(userResult);
  }
}
