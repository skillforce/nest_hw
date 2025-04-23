import { Injectable } from '@nestjs/common';
import { MeViewDto } from '../../api/view-dto/users-view-dto/users.view-dto';
import { User } from '../../domain/user.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getMe(userId: string): Promise<MeViewDto> {
    const userResult = await this.dataSource.query<User[]>(
      'SELECT * FROM "Users" WHERE "id" = $1 AND "deletedAt" IS NULL',
      [userId],
    );
    if (!userResult.length) {
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

    return MeViewDto.mapToViewDto(userResult[0]);
  }
}
