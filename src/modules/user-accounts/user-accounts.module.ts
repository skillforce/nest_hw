import { Module } from '@nestjs/common';
import { UsersController } from './api/users-controller';
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
import { CoreConfig, Environments } from '../../core/configs/core.config';
import { UpdateRefreshTokenUsecase } from './application/usecases/update-refresh-token.usecase';
import { GenerateNewTokensUsecase } from './application/usecases/generate-new-tokens.usecase';
import { LogoutUserUsecase } from './application/usecases/logout-user.usecase';
import { JwtRefreshStrategy } from '../security-devices/guards/refreshToken/refreshJwt.strategy';
import { SecurityDevicesModule } from '../security-devices/security-devices.module';
import { EmailConfirmationRepository } from './infrastructure/email-confirmation.repository';
import { PasswordRecoveryConfirmationRepository } from './infrastructure/password-recovery-confirmation.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/entities/user.entity';
import { PasswordRecoveryConfirmation } from './domain/entities/password-recovery-confirmation.entity';
import { EmailConfirmation } from './domain/entities/email-confirmation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      PasswordRecoveryConfirmation,
      EmailConfirmation,
    ]),
    JwtModule,
    SecurityDevicesModule,
    NotificationsModule,
    ThrottlerModule.forRootAsync({
      useFactory: (coreConfig: CoreConfig) => {
        // const isTesting = coreConfig.env === Environments.TESTING;

        return [];

        // return isTesting
        //   ? []
        //   : {
        //       throttlers: [
        //         {
        //           ttl: 10000,
        //           limit: 500,
        //         },
        //       ],
        //     };
      },
      inject: [CoreConfig],
    }),
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersQueryRepository,
    EmailConfirmationRepository,
    PasswordRecoveryConfirmationRepository,
    AuthQueryRepository,
    UsersRepository,
    BcryptService,
    EmailService,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    UserAccountsConfig,
    CreateUserUseCase,
    InitializeConfirmRegistrationUseCase,
    ResendConfirmationEmailUseCase,
    LoginUserUseCase,
    ConfirmRegistrationByCodeUseCase,
    InitializePasswordRecoveryUseCase,
    ChangePasswordByRecoveryCodeUseCase,
    UpdateRefreshTokenUsecase,
    GenerateNewTokensUsecase,
    LogoutUserUsecase,
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
