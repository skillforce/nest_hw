import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { BcryptService } from './bcrypt-service';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';
import { UserDto } from '../dto/user.dto';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly bcryptService: BcryptService,

    @InjectModel(User.name) private readonly UserModel: UserModelType,
  ) {}

  async createUser(dto: UserDto, isConfirmed = false): Promise<string> {
    const userWithSameLogin = await this.usersRepository.findByLogin(dto.login);
    const userWithSameEmail = await this.usersRepository.findByEmail(dto.email);
    if (userWithSameLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            field: 'login',
            message: 'user with this login already exists',
          },
        ],
        message: 'user with this login already exists',
      });
    }
    if (userWithSameEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            field: 'email',
            message: 'user with this email already exists',
          },
        ],
        message: 'user with this email already exists',
      });
    }

    const passwordHash = await this.bcryptService.hashPassword(dto.password);
    const user = this.UserModel.createInstance({
      login: dto.login,
      email: dto.email,
      passwordHash,
    });
    isConfirmed && user.confirmRegistration();
    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async deleteUser(id: string) {
    const userToDelete = await this.usersRepository.findOrNotFoundFail(id);

    userToDelete.makeDeleted();

    await this.usersRepository.save(userToDelete);
  }
}
