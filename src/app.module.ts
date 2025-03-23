import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserAccountsModule } from './features/user-accounts/user-accounts.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TestingModule } from './features/testing/testing.module';
import { BloggersPlatformModule } from './features/bloggers-platform/bloggers-platform.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GLOBAL_PREFIX } from './setup/global-prefix.setup';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'swagger-static'),
      serveRoot: GLOBAL_PREFIX,
    }),
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URL!),
    UserAccountsModule,
    TestingModule,
    BloggersPlatformModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
