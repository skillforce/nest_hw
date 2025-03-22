import { Module } from '@nestjs/common';
import { UsersController } from './api/users-controller';
import { UsersService } from './application/users-service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { BcryptService } from './application/bcrypt-service';
import { UsersRepository } from './infrastructure/users.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersQueryRepository,
    UsersRepository,
    BcryptService,
  ],
  exports: [BcryptService],
})
export class UserAccountsModule {}
