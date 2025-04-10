import { pipesSetup } from './pipes.setup';
import { INestApplication } from '@nestjs/common';
import { swaggerSetup } from './swagger.setup';
import { globalPrefixSetup } from './global-prefix.setup';

export function appSetup(app: INestApplication, isSwaggerEnabled: boolean) {
  pipesSetup(app);
  // globalPrefixSetup(app);
  swaggerSetup(app, isSwaggerEnabled);
}
