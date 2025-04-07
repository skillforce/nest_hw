import { Global, Module } from '@nestjs/common';
import { CoreConfig } from './core.config';
import { CqrsModule } from '@nestjs/cqrs';

@Global()
@Module({
  imports: [CqrsModule],
  exports: [CoreConfig, CqrsModule],
  providers: [CoreConfig],
})
export class CoreModule {}
