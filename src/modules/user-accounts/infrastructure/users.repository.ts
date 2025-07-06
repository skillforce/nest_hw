import { Injectable } from '@nestjs/common';
import { User } from '../domain/entities/user.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersOrmRepository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User | null> {
    return await this.usersOrmRepository.findOne({
      where: { id },
    });
  }
  async findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    return await this.usersOrmRepository.findOne({
      where: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  }
  async findUsersByLogin(login: string): Promise<User[] | null> {
    return await this.usersOrmRepository.find({
      where: { login },
    });
  }
  async findUsersByEmail(email: string): Promise<User[] | null> {
    return await this.usersOrmRepository.find({
      where: { email },
    });
  }
  async findByEmailOrNotFoundFail(email: string): Promise<User> {
    const result = await this.usersOrmRepository.findOne({
      where: { email },
    });
    if (!result) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            field: 'email',
            message: 'user with such email does not exist',
          },
        ],
        message: 'user not found',
      });
    }

    return result;
  }
  async findByIdOrNotFoundFail(id: number): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
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

    return user;
  }

  async save(user: Omit<User, 'id'> & { id?: number }): Promise<number> {
    const result = await this.usersOrmRepository.save(user);
    return result.id;
  }
}
