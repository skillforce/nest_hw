import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { UserDto } from '../../dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../../domain/user.entity';
import { UsersRepository } from '../../infrastructure/users.repository';
import { BcryptService } from '../bcrypt-service';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InitializeConfirmRegistrationCommand } from './initialize-confirm-registration.usecase';

export class CreateUserCommand {
  constructor(
    public dto: UserDto,
    public isConfirmed = false,
  ) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase
  implements ICommandHandler<CreateUserCommand, string>
{
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private bcryptService: BcryptService,
    private commandBus: CommandBus,
  ) {}

  async execute({ dto, isConfirmed }: CreateUserCommand): Promise<string> {
    await this.checkUserDtoForUniqueFields(dto);
    const passwordHash = await this.bcryptService.hashPassword(dto.password);
    const user = this.UserModel.createInstance({
      login: dto.login,
      email: dto.email,
      passwordHash,
    });
    if (isConfirmed) {
      user.confirmRegistration();
    }
    await this.usersRepository.save(user);

    if (!isConfirmed) {
      await this.commandBus.execute(
        new InitializeConfirmRegistrationCommand(user._id.toString()),
      );
    }

    return user._id.toString();
  }

  private async checkUserDtoForUniqueFields(dto: UserDto) {
    const userWithSameLogin = await this.usersRepository.findByLogin(dto.login);
    if (userWithSameLogin && userWithSameLogin.deletedAt === null) {
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

    const userWithSameEmail = await this.usersRepository.findByEmail(dto.email);
    if (userWithSameEmail && userWithSameEmail.deletedAt === null) {
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
  }
}
