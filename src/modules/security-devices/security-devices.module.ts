import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthMeta, AuthMetaSchema } from './domain/auth-meta.entity';
import { AuthMetaRepository } from './infrastructure/auth-meta.repository';
import { ExternalAuthMetaRepository } from './infrastructure/external/external.auth-meta.repository';
import { AuthMetaQueryRepository } from './infrastructure/query/auth-meta.query-repository';
import { SecurityController } from './api/security-controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AuthMeta.name,
        schema: AuthMetaSchema,
      },
    ]),
  ],
  controllers: [SecurityController],
  providers: [
    AuthMetaRepository,
    ExternalAuthMetaRepository,
    AuthMetaQueryRepository,
  ],
  exports: [ExternalAuthMetaRepository],
})
export class SecurityDevicesModule {}
