import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserDto } from '../../dto/user.dto';
import { User } from '../../domain/entities/user.entity';
import { UsersRepository } from '../../infrastructure/users.repository';
import { BcryptService } from '../bcrypt-service';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InitializeConfirmRegistrationCommand } from './initialize-confirm-registration.usecase';
import { EmailConfirmation } from '../../domain/entities/email-confirmation.entity';
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
  implements ICommandHandler<CreateUserCommand, number>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailConfirmationRepository: EmailConfirmationRepository,
    private bcryptService: BcryptService,
    private commandBus: CommandBus,
  ) {}

  async execute({ dto, isConfirmed }: CreateUserCommand): Promise<number> {
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
    const usersWithSameLogin = await this.usersRepository.findUsersByLogin(
      dto.login,
    );

    if (usersWithSameLogin?.some((user) => user.deletedAt === null)) {
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

    const usersWithSameEmail = await this.usersRepository.findUsersByEmail(
      dto.email,
    );
    if (usersWithSameEmail?.some((user) => user.deletedAt === null)) {
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
  private createConfirmedUser(userId: number): Omit<EmailConfirmation, 'id'> {
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
