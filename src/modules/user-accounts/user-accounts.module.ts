import { Module } from '@nestjs/common';
import { UsersController } from './api/users-controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { BcryptService } from './application/bcrypt-service';
import { UsersRepository } from './infrastructure/users.repository';
import { AuthController } from './api/auth-controller';
import { AuthService } from './application/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { LocalStrategy } from './guards/local/local.strategy';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { NotificationsModule } from '../notifications/notifications.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './guards/throttle/throttle.guard';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './constants/auth-tokens.inject-contants';
import { UserAccountsConfig } from './config/user-accounts.config';
import { CreateUserUseCase } from './application/usecases/create-user.usecase';
import { EmailService } from '../notifications/email.service';
import { InitializeConfirmRegistrationUseCase } from './application/usecases/initialize-confirm-registration.usecase';
import { ResendConfirmationEmailUseCase } from './application/usecases/resend-confirmation-email.usecase';
import { LoginUserUseCase } from './application/usecases/login-user.usecase';
import { ConfirmRegistrationByCodeUseCase } from './application/usecases/confirm-registration-by-code.usecase';
import { InitializePasswordRecoveryUseCase } from './application/usecases/initialize-password-recovery.usecase';
import { ChangePasswordByRecoveryCodeUseCase } from './application/usecases/change-password-by-recovery-code.usecase';
import { DeleteUserByIdUseCase } from './application/usecases/delete-user-by-id.usecase';

@Module({
  imports: [
    JwtModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    NotificationsModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 10000,
          limit: 5,
        },
      ],
    }),
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersQueryRepository,
    AuthQueryRepository,
    UsersRepository,
    BcryptService,
    EmailService,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    UserAccountsConfig,
    CreateUserUseCase,
    InitializeConfirmRegistrationUseCase,
    ResendConfirmationEmailUseCase,
    LoginUserUseCase,
    ConfirmRegistrationByCodeUseCase,
    InitializePasswordRecoveryUseCase,
    ChangePasswordByRecoveryCodeUseCase,
    DeleteUserByIdUseCase,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },

    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (userAccountConfig: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: userAccountConfig.accessTokenSecret,
          signOptions: { expiresIn: userAccountConfig.accessTokenExpireIn },
        });
      },
      inject: [UserAccountsConfig],
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (userAccountConfig: UserAccountsConfig): JwtService => {
        return new JwtService({
          secret: userAccountConfig.refreshTokenSecret,
          signOptions: { expiresIn: userAccountConfig.refreshTokenExpireIn },
        });
      },
      inject: [UserAccountsConfig],
    },
  ],
  exports: [BcryptService],
})
export class UserAccountsModule {}
