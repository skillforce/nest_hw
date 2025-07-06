import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserViewDto } from '../../api/view-dto/users-view-dto/users.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/users-input-dto/get-users-query-params.input-dto';
import { FindOptionsWhere, ILike, IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersOrmRepository: Repository<User>,
  ) {}
  async getByIdOrNotFoundFail(id: number): Promise<UserViewDto> {
    const userResult = await this.usersOrmRepository.findOne({
      where: { id: id, deletedAt: IsNull() },
    });

    if (!userResult) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'id',
            message: 'user not found',
          },
        ],
        message: 'user not found',
      });
    }

    return UserViewDto.mapToViewDto(userResult);
  }

  async getAllUsers(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const sortDirection =
      query.sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const skip = query.calculateSkip();
    const limit = query.pageSize;

    let whereConditions: FindOptionsWhere<User>[] = [];

    if (query.searchLoginTerm && query.searchEmailTerm) {
      whereConditions = [
        { deletedAt: IsNull(), login: ILike(`%${query.searchLoginTerm}%`) },
        { deletedAt: IsNull(), email: ILike(`%${query.searchEmailTerm}%`) },
      ];
    } else if (query.searchLoginTerm) {
      whereConditions = [
        { deletedAt: IsNull(), login: ILike(`%${query.searchLoginTerm}%`) },
      ];
    } else if (query.searchEmailTerm) {
      whereConditions = [
        { deletedAt: IsNull(), email: ILike(`%${query.searchEmailTerm}%`) },
      ];
    } else {
      whereConditions = [{ deletedAt: IsNull() }];
    }

    const [users, totalCount] = await this.usersOrmRepository.findAndCount({
      where: whereConditions,
      order: { [query.sortBy]: sortDirection },
      skip,
      take: limit,
    });

    const items = users.map(UserViewDto.mapToViewDto);

    return PaginatedViewDto.mapToView({
      items,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }
}
