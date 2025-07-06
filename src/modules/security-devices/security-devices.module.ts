import { Module } from '@nestjs/common';
import { AuthMetaRepository } from './infrastructure/auth-meta.repository';
import { ExternalAuthMetaRepository } from './infrastructure/external/external.auth-meta.repository';
import { AuthMetaQueryRepository } from './infrastructure/query/auth-meta.query-repository';
import { SecurityController } from './api/security-controller';
import { DeleteSessionByDeviceIdUseCase } from './application/usecases/delete-session-by-device-id.usecase';
import { DeleteAllUserDevicesExceptCurrentOneUseCase } from './application/usecases/delete-all-devices-except-current-one.usecase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMeta } from './domain/auth-meta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuthMeta])],
  controllers: [SecurityController],
  providers: [
    AuthMetaRepository,
    ExternalAuthMetaRepository,
    AuthMetaQueryRepository,
    DeleteSessionByDeviceIdUseCase,
    DeleteAllUserDevicesExceptCurrentOneUseCase,
  ],
  exports: [ExternalAuthMetaRepository],
})
export class SecurityDevicesModule {}
