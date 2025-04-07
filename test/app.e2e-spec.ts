import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../src/app.module';
import { appSetup } from '../src/setup/app.setup';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSetup(app);

    await app.init();

    await supertest(app.getHttpServer())
      .delete('/testing/all-data')
      .expect(204);
  });

  it('/ (GET)', () => {
    return supertest(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!1');
  });
  it('/create users)', async () => {
    await supertest(app.getHttpServer())
      .post('/users')
      .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
      .send({
        login: 'admin',
        password: '12345564',
        email: 'KvBZV@example.com',
      })
      .expect(201);
  });
});
