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
import { CoreConfig } from './core/core.config';
import { CoreModule } from './core/core.module';
import { SWAGGER_PREFIX } from './setup/swagger.setup';
import { SecurityDevicesModule } from './modules/security-devices/security-devices.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    configModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'swagger-static'),
      serveRoot: SWAGGER_PREFIX,
    }),
    // MongooseModule.forRootAsync({
    //   useFactory: (coreConfig: CoreConfig) => {
    //     const uri = coreConfig.mongoURI;
    //     console.log('DB_URI', uri);
    //
    //     return {
    //       uri: uri,
    //     };
    //   },
    //   inject: [CoreConfig],
    // }),
    TypeOrmModule.forRootAsync({
      useFactory: (coreConfig: CoreConfig) => {
        console.log('PG_DB_URI', coreConfig.postgresHost);
        console.log('PG_DB_PORT', coreConfig.postgresPort);
        console.log('PG_DB_USER', coreConfig.postgresUser);
        console.log('PG_DB_PASSWORD', coreConfig.postgresPassword);
        console.log('PG_DB_NAME', coreConfig.postgresDatabase);

        return {
          type: 'postgres',
          host: coreConfig.postgresHost,
          port: coreConfig.postgresPort,
          username: coreConfig.postgresUser,
          password: coreConfig.postgresPassword,
          database: coreConfig.postgresDatabase,
          ssl: {
            rejectUnauthorized: false,
          },
          autoLoadEntities: false,
          synchronize: false,
        };
      },
      inject: [CoreConfig],
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
