import { Global, Module } from '@nestjs/common';
import { CoreConfig } from './configs/core.config';
import { CqrsModule } from '@nestjs/cqrs';
import { DBConfig } from './configs/db.config';

@Global()
@Module({
  imports: [CqrsModule],
  exports: [CoreConfig, CqrsModule, DBConfig],
  providers: [CoreConfig, DBConfig],
})
export class CoreModule {}
