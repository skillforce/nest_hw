import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { BcryptService } from './bcrypt-service';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserPasswordDto, UserDto } from '../dto/user.dto';
import { randomUUID } from 'node:crypto';
import { EmailLayouts } from '../../notifications/layout-templates/content-templetes/email-layout-service';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { UsersService } from './users-service';
import { EmailService } from '../../notifications/email.service';
import { UserDocument } from '../domain/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly userService: UsersService,
    private readonly bcryptService: BcryptService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user = await this.usersRepository.findByLoginOrEmail(username);

    if (!user) {
      return null;
    }

    const isPasswordValid = await this.bcryptService.comparePasswords(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return null;
    }

    return { id: user.id + '' };
  }
  async initializeConfirmEmail(user: UserDocument) {
    const confirmationCode = randomUUID();
    user.setEmailConfirmationCode(confirmationCode);
    await this.usersRepository.save(user);

    this.emailService.sendConfirmationEmail(
      user.email,
      confirmationCode,
      EmailLayouts.REGISTRATION,
    );
  }
  login(userId: string): { accessToken: string } {
    const accessToken = this.jwtService.sign({ id: userId } as UserContextDto);

    return { accessToken };
  }

  async registerUser(dto: UserDto) {
    const createdUserId = await this.userService.createUser(dto);
    const user = await this.usersRepository.findOrNotFoundFail(createdUserId);
    await this.initializeConfirmEmail(user);
  }

  async changePassword({ newPassword, recoveryCode }: UpdateUserPasswordDto) {
    const user =
      await this.usersRepository.findByPasswordRecoveryCodeOrNotFoundFail(
        recoveryCode,
      );

    const isConfirmationCodeLegit = user.isPasswordRecoveryConfirmationValid();

    if (!isConfirmationCodeLegit) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            field: 'recoveryCode',
            message: 'recoveryCode is not valid',
          },
        ],
        message: 'recoveryCode is not valid',
      });
    }
    const newPasswordHash = await this.bcryptService.hashPassword(newPassword);
    user.confirmPasswordRecovery(newPasswordHash);
    await this.usersRepository.save(user);
  }

  async initPasswordRecovery(email: string) {
    const user = await this.usersRepository.findByEmailOrNotFoundFail(email);

    const confirmationCode = randomUUID();

    user.setPasswordRecoveryConfirmationCode(confirmationCode);
    await this.usersRepository.save(user);

    this.emailService.sendConfirmationEmail(
      user.email,
      confirmationCode,
      EmailLayouts.PASSWORD_RECOVERY,
    );
  }

  async resendRegistrationEmail(email: string) {
    const user = await this.usersRepository.findByEmailOrNotFoundFail(email);

    if (
      user.emailConfirmation.isConfirmed ||
      !user.emailConfirmation.confirmationCode
    ) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            field: 'email',
            message: 'user is already confirmed',
          },
        ],
        message: 'user is already confirmed',
      });
    }
    await this.initializeConfirmEmail(user);
  }

  async confirmRegistrationByCode(code: string) {
    const user =
      await this.usersRepository.findByConfirmationCodeOrNotFoundFail(code);
    const isConfirmationCodeLegit = user.isEmailConfirmationValid(code);

    if (!isConfirmationCodeLegit) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            field: 'code',
            message: 'code is not valid',
          },
        ],
        message: 'code is not valid',
      });
    }

    user.confirmRegistration();
    await this.usersRepository.save(user);
  }
}
