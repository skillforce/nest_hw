import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../src/modules/user-accounts/constants/auth-tokens.inject-contants';
import { initSettings } from './helpers/init-settings';
import { UserAccountsConfig } from '../src/modules/user-accounts/config/user-accounts.config';
import { deleteAllData } from './helpers/delete-all-data';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../src/setup/global-prefix.setup';
import { BlogsTestManager } from './helpers/blogs-test-manager';
import {
  CreateBlogInputDto,
  UpdateBlogInputDto,
} from '../src/modules/bloggers-platform/api/input-dto/blog-input-dto/blog.input-dto';

describe('Blogs Controller (e2e)', () => {
  let app: INestApplication;
  let blogsTestManager: BlogsTestManager;

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
    blogsTestManager = result.blogsTestManager;
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
      name: 'new blog',
      description: 'description',
      websiteUrl: 'https://someurl.com',
    };
    const createdBlogResponseBody = await blogsTestManager.createBlog(blogBody);

    expect(createdBlogResponseBody).toEqual({
      id: expect.any(String),
      name: blogBody.name,
      description: blogBody.description,
      websiteUrl: blogBody.websiteUrl,
      createdAt: expect.any(String),
      isMembership: false,
    });
    const blogsResponseBody = await blogsTestManager.getBlogs();

    expect(blogsResponseBody.items).toHaveLength(1);
  });
  it('should update blog for authenticated user', async () => {
    const blogBody = {
      name: 'name',
      description: 'description',
      websiteUrl: 'https://www.websiteUrl.com',
    };
    await blogsTestManager.createBlog(blogBody);

    const blogsResponseAfterCreationBody = await blogsTestManager.getBlogs();

    expect(blogsResponseAfterCreationBody.items).toHaveLength(1);

    const updatedPostBody = {
      name: 'new name',
      description: 'new description',
      websiteUrl: 'https://www.new-websiteUrl.com',
    };

    await blogsTestManager.updateBlog(
      updatedPostBody,
      blogsResponseAfterCreationBody.items[0].id,
    );

    await request(app.getHttpServer())
      .put(
        `/${GLOBAL_PREFIX}/sa/blogs/${blogsResponseAfterCreationBody.items[0].id}`,
      )
      .auth('wrong', 'wrong')
      .send(updatedPostBody)
      .expect(401);

    const blogsResponse = await blogsTestManager.getBlogs();

    expect(blogsResponse.items).toHaveLength(1);
    expect(blogsResponse.items[0]).toEqual({
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
    const createdBlogResponseBody = await blogsTestManager.createBlog(blogBody);

    const blogsResponseBody = await blogsTestManager.getBlogs();

    expect(blogsResponseBody.items).toHaveLength(1);

    await blogsTestManager.deleteBlog(createdBlogResponseBody.id);
    await blogsTestManager.deleteBlog(
      createdBlogResponseBody.id,
      HttpStatus.NOT_FOUND,
    );
    const blogsResponseAfterDeleteBody = await blogsTestManager.getBlogs();

    expect(blogsResponseAfterDeleteBody.items).toHaveLength(0);
  });

  it('should return error 404 when try to delete unexist blog', async () => {
    const blogBody = {
      name: 'name',
      description: 'description',
      websiteUrl: 'https://www.websiteUrl.com',
    };

    await blogsTestManager.createBlog(blogBody);
    await blogsTestManager.deleteBlog(
      '23456789',
      HttpStatus.NOT_FOUND,
    );
  });

  it('should return error 404 when try to get blog which was already deleted', async () => {
    const blogBody = {
      name: 'name',
      description: 'description',
      websiteUrl: 'https://www.websiteUrl.com',
    };
    const createdBlogResponseBody = await blogsTestManager.createBlog(blogBody);
    await blogsTestManager.deleteBlog(createdBlogResponseBody.id);
    await blogsTestManager.getBlogById(
      createdBlogResponseBody.id,
      HttpStatus.NOT_FOUND,
    );
  });
  it('should return correct error response if try to CREATE blog with incorrect data', async () => {
    const blogBody = {
      nam: 'somename',
      websiteUrl: 'invalid-url',
      description: 'description',
    };
    const createdBlogResponseBody = await blogsTestManager.createBlog(
      blogBody as unknown as CreateBlogInputDto,
      HttpStatus.BAD_REQUEST,
    );

    expect(createdBlogResponseBody).toEqual({
      errorsMessages: [
        {
          field: 'name',
          message: expect.any(String),
        },
        {
          field: 'websiteUrl',
          message: expect.any(String),
        },
      ],
    });
  });
  it('should return correct error response if try to UPDATE blog with incorrect data', async () => {
    const blogBody = {
      name: 'somename',
      websiteUrl: 'https://www.websiteUrl.com',
      description: 'description',
    };
    const createdBlogResponseBody = await blogsTestManager.createBlog(blogBody);

    const updateBlogIncorrectBody = {
      nam: 'somename',
      websiteUrl: 'invalid-url',
      description: 'description',
    };

    const updatedBlogResponseBody = await blogsTestManager.updateBlog(
      updateBlogIncorrectBody as unknown as UpdateBlogInputDto,
      createdBlogResponseBody.id,
      HttpStatus.BAD_REQUEST,
    );

    expect(updatedBlogResponseBody).toEqual({
      errorsMessages: [
        {
          field: 'name',
          message: expect.any(String),
        },
        {
          field: 'websiteUrl',
          message: expect.any(String),
        },
      ],
    });
  });
});
