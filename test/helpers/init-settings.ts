import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { appSetup } from '../../src/setup/app.setup';
import { UsersTestManager } from './users-test-manager';
import { deleteAllData } from './delete-all-data';
import { EmailService } from '../../src/modules/notifications/email.service';
import { EmailServiceMock } from '../mock/email-service.mock';
import { initAppModule } from '../../src/init-app-module';
import { CoreConfig } from '../../src/core/configs/core.config';
import { BlogsTestManager } from './blogs-test-manager';
import { PostsTestManager } from './posts-test-manager';
import { CommentsTestManager } from './comments-test-manager';
import { getConnectionToken } from '@nestjs/typeorm';
import { QuestionsTestManager } from './questions-test-manager';

export const initSettings = async (
  //передаем callback, который получает ModuleBuilder, если хотим изменить настройку тестового модуля
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const DynamicAppModule = await initAppModule();
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [DynamicAppModule],
  })
    .overrideProvider(EmailService)
    .useClass(EmailServiceMock);

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();

  const app = testingAppModule.createNestApplication();

  const coreConfig = app.get<CoreConfig>(CoreConfig);
  appSetup(app, coreConfig);

  await app.init();

  const databaseConnection = app.get<Connection>(getConnectionToken());
  const httpServer = app.getHttpServer();
  const userTestManager = new UsersTestManager(app);
  const blogsTestManager = new BlogsTestManager(app);
  const postsTestManager = new PostsTestManager(app);
  const commentsTestManager = new CommentsTestManager(app);
  const questionsTestManager = new QuestionsTestManager(app);

  await deleteAllData(app);

  return {
    app,
    databaseConnection,
    httpServer,
    userTestManager,
    blogsTestManager,
    postsTestManager,
    commentsTestManager,
    questionsTestManager,
  };
};
