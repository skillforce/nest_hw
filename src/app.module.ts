import { configModule } from './dynamic-config-module';
import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TestingModule } from './modules/testing/testing.module';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { APP_FILTER } from '@nestjs/core';
import { AllHttpExceptionsFilter } from './core/exceptions/filters/all-exceptions.filter';
import { DomainHttpExceptionsFilter } from './core/exceptions/filters/domain-exceptions.filter';
import { CoreConfig } from './core/configs/core.config';
import { CoreModule } from './core/core.module';
import { SWAGGER_PREFIX } from './setup/swagger.setup';
import { SecurityDevicesModule } from './modules/security-devices/security-devices.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DBConfig } from './core/configs/db.config';

@Module({
  imports: [
    configModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'swagger-static'),
      serveRoot: SWAGGER_PREFIX,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (DBConfig: DBConfig) => {
        console.log('PG_DB_URI', DBConfig.postgresHost);
        console.log('PG_DB_PORT', DBConfig.postgresPort);
        console.log('PG_DB_USER', DBConfig.postgresUser);
        console.log('PG_DB_PASSWORD', DBConfig.postgresPassword);
        console.log('PG_DB_NAME', DBConfig.postgresDatabase);

        return {
          type: 'postgres',
          host: DBConfig.postgresHost,
          port: DBConfig.postgresPort,
          username: DBConfig.postgresUser,
          password: DBConfig.postgresPassword,
          database: DBConfig.postgresDatabase,
          ssl: false,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
      inject: [DBConfig],
    }),
    UserAccountsModule,
    SecurityDevicesModule,
    BloggersPlatformModule,
    CoreModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllHttpExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter,
    },
  ],
})
export class AppModule {
  static forRoot(coreConfig: CoreConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [...(coreConfig.includeTestingModule ? [TestingModule] : [])], // Add dynamic modules here if needed
    };
  }
}
