import { pipesSetup } from './pipes.setup';
import { swaggerSetup } from './swagger.setup';
import { globalPrefixSetup } from './global-prefix.setup';
import { CoreConfig } from '../core/core.config';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';

export function appSetup(app: NestExpressApplication, coreConfig: CoreConfig) {
  app.enableCors();

  app.use(cookieParser());
  app.set('trust proxy', true);
  pipesSetup(app);
  globalPrefixSetup(app);
  swaggerSetup(app, coreConfig);
}
