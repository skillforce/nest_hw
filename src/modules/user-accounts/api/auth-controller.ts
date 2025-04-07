import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  LoginInputDto,
  NewPasswordInputDto,
  PasswordRecoveryInputDto,
  RegistrationConfirmationInputDto,
  RegistrationInputDto,
  RegistrationResendingInputDto,
} from './input-dto/auth-input-dto/auth.input-dto';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { AuthQueryRepository } from '../infrastructure/query/auth.query-repository';
import { SkipThrottle } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/usecases/create-user.usecase';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { ResendConfirmationEmailCommand } from '../application/usecases/resend-confirmation-email.usecase';
import { LoginUserCommand } from '../application/usecases/login-user.usecase';
import { Response } from 'express';
import { ConfirmRegistrationByCodeCommand } from '../application/usecases/confirm-registration-by-code.usecase';
import { InitializePasswordRecoveryCommand } from '../application/usecases/initialize-password-recovery.usecase';
import { ChangePasswordByRecoveryCodeCommand } from '../application/usecases/change-password-by-recovery-code.usecase';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authQueryRepository: AuthQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @SkipThrottle()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(
    @Body() _: LoginInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, accessToken } = await this.commandBus.execute<
      LoginUserCommand,
      { accessToken: string; refreshToken: string }
    >(new LoginUserCommand(user.id));

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true, // prevent JS access
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { accessToken };
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() dto: RegistrationInputDto) {
    const createdUserId = await this.commandBus.execute<
      CreateUserCommand,
      string
    >(new CreateUserCommand(dto));

    return await this.usersQueryRepository.getByIdOrNotFoundFail(createdUserId);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(
    @Body() { code }: RegistrationConfirmationInputDto,
  ) {
    return this.commandBus.execute<ConfirmRegistrationByCodeCommand, void>(
      new ConfirmRegistrationByCodeCommand(code),
    );
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendRegistrationEmail(
    @Body() { email }: RegistrationResendingInputDto,
  ) {
    return await this.commandBus.execute<ResendConfirmationEmailCommand, void>(
      new ResendConfirmationEmailCommand(email),
    );
  }

  @Post('password-recovery')
  async recoverPassword(@Body() { email }: PasswordRecoveryInputDto) {
    return this.commandBus.execute<InitializePasswordRecoveryCommand, void>(
      new InitializePasswordRecoveryCommand(email),
    );
  }

  @Post('new-password')
  async createNewPassword(@Body() dto: NewPasswordInputDto) {
    return await this.commandBus.execute<
      ChangePasswordByRecoveryCodeCommand,
      void
    >(
      new ChangePasswordByRecoveryCodeCommand(
        dto.newPassword,
        dto.recoveryCode,
      ),
    );
  }

  @SkipThrottle()
  @ApiBearerAuth()
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@ExtractUserFromRequest() user: UserContextDto) {
    return this.authQueryRepository.Me(user.id);
  }
}
