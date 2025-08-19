import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../src/modules/user-accounts/constants/auth-tokens.inject-contants';
import { initSettings } from './helpers/init-settings';
import { UserAccountsConfig } from '../src/modules/user-accounts/config/user-accounts.config';
import { UsersTestManager } from './helpers/users-test-manager';
import { deleteAllData } from './helpers/delete-all-data';
import { GLOBAL_PREFIX } from '../src/setup/global-prefix.setup';
import { CreateUserInputDto } from '../src/modules/user-accounts/api/input-dto/users-input-dto/user.input-dto';

describe('Users Controller (e2e)', () => {
  let app: INestApplication;
  let userTestManager: UsersTestManager;

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
    userTestManager = result.userTestManager;
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return paginated response with empty items array', async () => {
    const response = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/sa/users`)
      .auth('admin', 'qwerty')
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it('should return 401 error when authorization header is missing', async () => {
    await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/sa/users`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should create confirmed user', async () => {
    const body: CreateUserInputDto = {
      login: 'name1',
      password: 'qwerty',
      email: 'email@email.em',
    };

    const response = await userTestManager.createUser(body);

    expect(response).toEqual({
      id: expect.any(String),
      login: body.login,
      email: body.email,
      createdAt: expect.any(String),
    });
  });

  it("shouldn't create user when auth headers is missing or body is invalid", async () => {
    const wrongBody: CreateUserInputDto = {
      login: '1',
      password: 'q',
      email: 'email',
    };

    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/sa/users`)
      .send(wrongBody)
      .expect(HttpStatus.UNAUTHORIZED);

    const response = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/sa/users`)
      .send(wrongBody)
      .auth('admin', 'qwerty')
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.errorsMessages).toEqual([
      {
        field: 'login',
        message: expect.any(String),
      },
      {
        field: 'email',
        message: expect.any(String),
      },
      {
        field: 'password',
        message: expect.any(String),
      },
    ]);
  });
  it('should delete user', async () => {
    const body: CreateUserInputDto = {
      login: 'name1',
      password: 'qwerty1',
      email: 'email@email.em',
    };

    await userTestManager.createUser(body);

    const userListAfterCreation = await userTestManager.getUsers();

    expect(userListAfterCreation.length).toBe(1);

    await userTestManager.deleteUser(userListAfterCreation[0].id);

    const userListAfterDelete = await userTestManager.getUsers();

    expect(userListAfterDelete.length).toBe(0);
  });

  it("shouldn't delete user while user not found or user already deleted", async () => {
    const body: CreateUserInputDto = {
      login: 'name1',
      password: 'qwerty1',
      email: 'email@email.em',
    };
    await userTestManager.createUser(body);

    const userListAfterCreation = await userTestManager.getUsers();

    await userTestManager.deleteUser('dscsad', HttpStatus.BAD_REQUEST);
    await userTestManager.deleteUser(userListAfterCreation[0].id);
    await userTestManager.deleteUser(
      userListAfterCreation[0].id,
      HttpStatus.NOT_FOUND,
    );
  });
});
