import { Injectable } from '@nestjs/common';
import { MeViewDto } from '../../api/view-dto/users-view-dto/users.view-dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../../domain/user.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class AuthQueryRepository {
  constructor(
    @InjectModel(User.name) private readonly UserModel: UserModelType,
  ) {}

  async getMe(userId: string): Promise<MeViewDto> {
    const user = await this.UserModel.findOne({ _id: userId, deletedAt: null });
    if (!user) {
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

    return MeViewDto.mapToViewDto(user);
  }
}
