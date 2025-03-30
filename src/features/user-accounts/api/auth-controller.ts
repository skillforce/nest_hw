import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
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
import { AuthService } from '../application/auth.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { AuthQueryRepository } from '../infrastructure/query/auth.query-repository';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authQueryRepository: AuthQueryRepository,
  ) {}

  @SkipThrottle()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(
    @Body() _: LoginInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ) {
    return this.authService.login(user.id);
  }

  @Post('registration')
  async register(@Body() dto: RegistrationInputDto) {
    return this.authService.registerUser(dto);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(
    @Body() { code }: RegistrationConfirmationInputDto,
  ) {
    return this.authService.confirmRegistrationByCode(code);
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendRegistrationEmail(
    @Body() { email }: RegistrationResendingInputDto,
  ) {
    return this.authService.resendRegistrationEmail(email);
  }

  @Post('password-recovery')
  async recoverPassword(@Body() { email }: PasswordRecoveryInputDto) {
    return this.authService.initPasswordRecovery(email);
  }

  @Post('new-password')
  async createNewPassword(@Body() dto: NewPasswordInputDto) {
    return this.authService.changePassword(dto);
  }

  @SkipThrottle()
  @ApiBearerAuth()
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@ExtractUserFromRequest() user: UserContextDto) {
    return this.authQueryRepository.Me(user.id);
  }
}
