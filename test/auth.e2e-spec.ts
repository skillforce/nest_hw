import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../src/modules/user-accounts/constants/auth-tokens.inject-contants';
import { initSettings } from './helpers/init-settings';
import { UserAccountsConfig } from '../src/modules/user-accounts/config/user-accounts.config';
import { UsersTestManager } from './helpers/users-test-manager';
import { deleteAllData } from './helpers/delete-all-data';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../src/setup/global-prefix.setup';

describe('Users Controller (e2e)', () => {
  let app: INestApplication;
  let userTestManger: UsersTestManager;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      moduleBuilder
        .overrideProvider(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
        .useFactory({
          factory: (userAccountsConfig: UserAccountsConfig) => {
            return new JwtService({
              secret: userAccountsConfig.accessTokenSecret,
              signOptions: {
                expiresIn: userAccountsConfig.accessTokenExpireIn,
              },
            });
          },
          inject: [UserAccountsConfig],
        }),
    );
    app = result.app;
    userTestManger = result.userTestManger;
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should login user', async () => {
    const userBody = {
      login: 'login',
      email: 'email@email.com',
      password: 'password',
    };
    const user = await userTestManger.createUser(userBody);

    const loginResponseBody = await userTestManger.login(
      user.login,
      userBody.password,
    );
    console.log(loginResponseBody);

    expect(loginResponseBody.accessToken).toBeDefined();
    expect(loginResponseBody.refreshToken).toBeDefined();
  });
  it("shouldn't login user with wrong password or email or login", async () => {
    const userBody = {
      login: 'login',
      email: 'email@email.com',
      password: 'password',
    };
    await userTestManger.createUser(userBody);

    await userTestManger.login(
      'wrong login',
      'wrong password',
      HttpStatus.UNAUTHORIZED,
    );

    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/login`)
      .send({ wrongField: userBody.login, pass: userBody.password })
      .expect(HttpStatus.BAD_REQUEST);
  });
  it('should register user if email and login is unique', async () => {
    const userBody = {
      login: 'login',
      email: 'email@email.com',
      password: 'password',
    };

    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration`)
      .send(userBody)
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration`)
      .send(userBody)
      .expect(HttpStatus.BAD_REQUEST);
  });
  it("shouldn't register user if there are some wrong fields", async () => {
    const userBody = {
      logins: 'login',
      emaild: 'email@email.com',
      passwordf: 'password',
    };

    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/registration`)
      .send(userBody)
      .expect(HttpStatus.BAD_REQUEST);
  });
  it('should return me info', async () => {
    const userBody = {
      login: 'login',
      email: 'email@email.com',
      password: 'password',
    };
    const user = await userTestManger.createUser(userBody);

    const loginResponseBody = await userTestManger.login(
      user.login,
      userBody.password,
    );

    const response = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/auth/me`)
      .auth(loginResponseBody.accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      userId: user.id,
      login: user.login,
      email: user.email,
    });
  });
});
