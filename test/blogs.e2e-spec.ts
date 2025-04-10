import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../src/modules/user-accounts/constants/auth-tokens.inject-contants';
import { initSettings } from './helpers/init-settings';
import { UserAccountsConfig } from '../src/modules/user-accounts/config/user-accounts.config';
import { UsersTestManager } from './helpers/users-test-manager';
import { deleteAllData } from './helpers/delete-all-data';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../src/setup/global-prefix.setup';

describe('Blogs Controller (e2e)', () => {
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

  it('should get paginated response with empty items array', async () => {
    const blogsResponse = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/blogs`)
      .expect(200);

    expect(blogsResponse.body).toEqual({
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });
  it('should create blog for authenticated user', async () => {
    const blogBody = {
      name: 'name',
      description: 'description',
      websiteUrl: 'https://www.websiteUrl.com',
    };
    const createdBlogResponse = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/blogs`)
      .auth('admin', 'qwerty')
      .send(blogBody)
      .expect(201);

    expect(createdBlogResponse.body).toEqual({
      id: expect.any(String),
      name: blogBody.name,
      description: blogBody.description,
      websiteUrl: blogBody.websiteUrl,
      createdAt: expect.any(String),
      isMembership: false,
    });
    const blogsResponse = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/blogs`)
      .expect(200);

    expect(blogsResponse.body.items).toHaveLength(1);
  });
  it('should update blog for authenticated user', async () => {
    const blogBody = {
      name: 'name',
      description: 'description',
      websiteUrl: 'https://www.websiteUrl.com',
    };
    const createdPostResponse = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/blogs`)
      .auth('admin', 'qwerty')
      .send(blogBody)
      .expect(201);

    const updatedPostBody = {
      name: 'new name',
      description: 'new description',
      websiteUrl: 'https://www.new-websiteUrl.com',
    };
    await request(app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/blogs/${createdPostResponse.body.id}`)
      .auth('admin', 'qwerty')
      .send(updatedPostBody)
      .expect(204);

    await request(app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/blogs/${createdPostResponse.body.id}`)
      .auth('wrong', 'wrong')
      .send(updatedPostBody)
      .expect(401);

    const blogsResponse = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/blogs`)
      .expect(200);

    expect(blogsResponse.body.items).toHaveLength(1);
    expect(blogsResponse.body.items[0]).toEqual({
      id: expect.any(String),
      name: updatedPostBody.name,
      description: updatedPostBody.description,
      websiteUrl: updatedPostBody.websiteUrl,
      createdAt: expect.any(String),
      isMembership: false,
    });
  });
  it('should delete blog for authenticated user', async () => {
    const blogBody = {
      name: 'name',
      description: 'description',
      websiteUrl: 'https://www.websiteUrl.com',
    };
    const createdBlogResponse = await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/blogs`)
      .auth('admin', 'qwerty')
      .send(blogBody)
      .expect(201);

    const blogsResponse = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/blogs`)
      .expect(200);

    expect(blogsResponse.body.items).toHaveLength(1);

    await request(app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/blogs/${createdBlogResponse.body.id}`)
      .auth('admin', 'qwerty')
      .expect(204);
    await request(app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/blogs/${createdBlogResponse.body.id}`)
      .auth('admin', 'qwerty')
      .expect(HttpStatus.NOT_FOUND);
    const blogsResponseAfterDelete = await request(app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/blogs`)
      .expect(200);

    expect(blogsResponseAfterDelete.body.items).toHaveLength(0);
  });

  it('should return error 404 when try to delete unexist blog', async () => {
    const blogBody = {
      name: 'name',
      description: 'description',
      websiteUrl: 'https://www.websiteUrl.com',
    };
    await request(app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/blogs`)
      .auth('admin', 'qwerty')
      .send(blogBody)
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/blogs/63189b06003380064c4193be`)
      .auth('admin', 'qwerty')
      .expect(404);
  });
});
