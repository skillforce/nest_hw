import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserDto } from '../../dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../domain/user.entity';
import { UsersRepository } from '../../infrastructure/users.repository';
import { BcryptService } from '../bcrypt-service';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InitializeConfirmRegistrationCommand } from './initialize-confirm-registration.usecase';
import { EmailConfirmation } from '../../domain/schemas/email-confirmation.schema';
import { EmailConfirmationRepository } from '../../infrastructure/email-confirmation.repository';
import { CreateUserDomainDto } from '../../domain/dto/create-user.domain.dto';

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
    private usersRepository: UsersRepository,
    private emailConfirmationRepository: EmailConfirmationRepository,
    private bcryptService: BcryptService,
    private commandBus: CommandBus,
  ) {}

  async execute({ dto, isConfirmed }: CreateUserCommand): Promise<string> {
    await this.checkUserDtoForUniqueFields(dto);
    const passwordHash = await this.bcryptService.hashPassword(dto.password);
    const newUser = this.createUser({
      login: dto.login,
      email: dto.email,
      passwordHash,
    });

    const createdUserId = await this.usersRepository.save(newUser);
    if (isConfirmed) {
      const autoConfirmedEmailConfirmation =
        this.createConfirmedUser(createdUserId);
      await this.emailConfirmationRepository.save(
        autoConfirmedEmailConfirmation,
      );
    }

    if (!isConfirmed) {
      await this.commandBus.execute(
        new InitializeConfirmRegistrationCommand(createdUserId),
      );
    }

    return createdUserId;
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
  private createConfirmedUser(userId: string): EmailConfirmation {
    return {
      confirmationCode: null,
      confirmationExpiresAt: null,
      isConfirmed: true,
      userId,
    };
  }

  private createUser(dto: CreateUserDomainDto): Omit<User, 'id'> {
    return {
      login: dto.login,
      email: dto.email,
      passwordHash: dto.passwordHash,
      deletedAt: null,
    };
  }
}
