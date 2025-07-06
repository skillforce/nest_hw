import { pipesSetup } from './pipes.setup';
import { INestApplication } from '@nestjs/common';
import { swaggerSetup } from './swagger.setup';
import { globalPrefixSetup } from './global-prefix.setup';
import { CoreConfig } from '../core/configs/core.config';
import cookieParser from 'cookie-parser';

export function appSetup(app: INestApplication, coreConfig: CoreConfig) {
  app.enableCors();
  app.use(cookieParser());
  app.getHttpAdapter().getInstance().set('trust proxy', true);
  pipesSetup(app);
  globalPrefixSetup(app);
  swaggerSetup(app, coreConfig);
}
