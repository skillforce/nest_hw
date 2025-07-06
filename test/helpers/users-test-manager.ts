import { HttpStatus, INestApplication } from '@nestjs/common';
import request, { Request } from 'supertest';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';
import { delay } from './delay';
import { CreateUserInputDto } from '../../src/modules/user-accounts/api/input-dto/users-input-dto/user.input-dto';
import {
  MeViewDto,
  UserViewDto,
} from '../../src/modules/user-accounts/api/view-dto/users-view-dto/users.view-dto';

export class UsersTestManager {
  constructor(private app: INestApplication) {}

  async createUser(
    createModel: CreateUserInputDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<UserViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/sa/users`)
      .send(createModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response.body;
  }

  async getUsers(statusCode: number = HttpStatus.OK): Promise<UserViewDto[]> {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/sa/users`)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response.body.items;
  }

  async login(
    login: string,
    password: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/login`)
      .send({ loginOrEmail: login, password })
      .expect(statusCode);

    const refreshToken = response.headers['set-cookie']?.[0].split('=')[1];

    return {
      accessToken: response.body.accessToken,
      refreshToken,
    };
  }

  async me(
    accessToken: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<MeViewDto> {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/auth/me`)
      .auth(accessToken, { type: 'bearer' })
      .expect(statusCode);

    return response.body;
  }

  async createSeveralUsers(count: number): Promise<UserViewDto[]> {
    const usersPromises = [] as Promise<UserViewDto>[];

    for (let i = 0; i < count; ++i) {
      await delay(50);
      const response = this.createUser({
        login: `test` + i,
        email: `test${i}@gmail.com`,
        password: '123456789',
      });
      usersPromises.push(response);
    }

    return Promise.all(usersPromises);
  }

  async createAndLoginSeveralUsers(
    count: number,
  ): Promise<{ accessToken: string }[]> {
    const users = await this.createSeveralUsers(count);

    const loginPromises = users.map((user: UserViewDto) =>
      this.login(user.login, '123456789'),
    );

    return await Promise.all(loginPromises);
  }
  async deleteUser(
    userId: any,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<Request> {
    return await request(this.app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/sa/users/${userId}`)
      .auth('admin', 'qwerty')
      .expect(statusCode);
  }
}
