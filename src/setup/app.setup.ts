import { pipesSetup } from './pipes.setup';
import { INestApplication } from '@nestjs/common';
import { swaggerSetup } from './swagger.setup';
import { globalPrefixSetup } from './global-prefix.setup';
import { CoreConfig } from '../core/core.config';

export function appSetup(app: INestApplication, coreConfig: CoreConfig) {
  pipesSetup(app);
  globalPrefixSetup(app);
  swaggerSetup(app, coreConfig);
}
