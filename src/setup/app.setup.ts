import { pipesSetup } from './pipes.setup';
import { INestApplication } from '@nestjs/common';
import { swaggerSetup } from './swagger.setup';

export function appSetup(app: INestApplication, isSwaggerEnabled: boolean) {
  pipesSetup(app);
  app.enableCors();
  // globalPrefixSetup(app);
  swaggerSetup(app, isSwaggerEnabled);
}
