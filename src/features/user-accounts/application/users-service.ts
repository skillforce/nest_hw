import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { CreateUserInputDto } from '../api/input-dto/user.input-dto';
import { BcryptService } from './bcrypt-service';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly bcryptService: BcryptService,
    @InjectModel(User.name) private readonly UserModel: UserModelType,
  ) {}

  async createUser(dto: CreateUserInputDto): Promise<string> {
    const passwordHash = await this.bcryptService.hashPassword(
      dto.passwordHash,
    );
    const user = this.UserModel.createInstance({
      login: dto.login,
      email: dto.email,
      passwordHash,
    });
    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async deleteUser(id: string) {
    const userToDelete = await this.usersRepository.findOrNotFoundFail(id);

    userToDelete.makeDeleted();

    await this.usersRepository.save(userToDelete);
  }
}
