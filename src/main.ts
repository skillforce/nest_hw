import { NestFactory } from '@nestjs/core';
import { appSetup } from './setup/app.setup';
import { initAppModule } from './init-app-module';
import { CoreConfig } from './core/core.config';

async function bootstrap() {
  //with dynamic app module which can be created on the fly with additional modules
  const DynamicAppModule = await initAppModule();
  const app = await NestFactory.create(DynamicAppModule);

  const coreConfig = app.get<CoreConfig>(CoreConfig);
  app.enableCors();
  appSetup(app, coreConfig);

  const port = coreConfig.port;
  await app.listen(port, () => {
    console.log('App starting listen port: ', port);
    console.log('NODE_ENV: ', coreConfig.env);
  });
}
bootstrap();
