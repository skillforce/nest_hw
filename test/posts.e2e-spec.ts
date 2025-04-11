import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../src/modules/user-accounts/constants/auth-tokens.inject-contants';
import { initSettings } from './helpers/init-settings';
import { UserAccountsConfig } from '../src/modules/user-accounts/config/user-accounts.config';
import { deleteAllData } from './helpers/delete-all-data';
import { PostsTestManager } from './helpers/posts-test-manager';
import { BlogsTestManager } from './helpers/blogs-test-manager';
import { UsersTestManager } from './helpers/users-test-manager';
import { LikeStatusEnum } from '../src/modules/bloggers-platform/domain/dto/like-domain.dto';

describe('Posts Controller (e2e)', () => {
  let app: INestApplication;
  let postsTestManager: PostsTestManager;
  let blogsTestManager: BlogsTestManager;
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
    postsTestManager = result.postsTestManager;
    blogsTestManager = result.blogsTestManager;
    userTestManager = result.userTestManager;
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get paginated response with empty items array', async () => {
    const postsResponseBody = await postsTestManager.getPosts();
    expect(postsResponseBody).toEqual({
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  it('should create post for authenticated user', async () => {
    const blogBody = {
      name: 'somename',
      websiteUrl: 'https://www.websiteUrl.com',
      description: 'description',
    };

    const createdBlogResponseBody = await blogsTestManager.createBlog(blogBody);

    const postBody = {
      title: 'string',
      shortDescription: 'string',
      content: 'string',
      blogId: createdBlogResponseBody.id,
    };
    const createdPostResponseBody = await postsTestManager.createPost(postBody);

    const getPostsResponseBody = await postsTestManager.getPosts();
    const getPostByIdResponseBody = await postsTestManager.getPostById(
      createdPostResponseBody.id,
    );

    expect(getPostByIdResponseBody).toEqual({
      id: createdPostResponseBody.id,
      title: postBody.title,
      shortDescription: postBody.shortDescription,
      content: postBody.content,
      blogId: createdBlogResponseBody.id,
      blogName: createdBlogResponseBody.name,
      createdAt: expect.any(String),
      extendedLikesInfo: {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    });

    expect(getPostsResponseBody.items).toHaveLength(1);
  });

  it('should update post', async () => {
    const blogBody = {
      name: 'somename',
      websiteUrl: 'https://www.websiteUrl.com',
      description: 'description',
    };
    const blogBodySecond = {
      name: 'somenames',
      websiteUrl: 'https://www.websiteUrl.comd',
      description: 'descriptionf',
    };
    const createdBlogResponseBody = await blogsTestManager.createBlog(blogBody);
    const createdBlogSecondResponseBody =
      await blogsTestManager.createBlog(blogBodySecond);

    const postBody = {
      title: 'string',
      shortDescription: 'string',
      content: 'string',
      blogId: createdBlogResponseBody.id,
    };
    const createdPostResponseBody = await postsTestManager.createPost(postBody);

    const updatePostBody = {
      title: 'string',
      shortDescription: 'string',
      content: 'string',
      blogId: createdBlogSecondResponseBody.id,
    };
    await postsTestManager.updatePost(
      createdPostResponseBody.id,
      updatePostBody,
    );

    const getPostByIdResponseBody = await postsTestManager.getPostById(
      createdPostResponseBody.id,
    );

    expect(getPostByIdResponseBody).toEqual({
      id: createdPostResponseBody.id,
      title: updatePostBody.title,
      shortDescription: updatePostBody.shortDescription,
      content: updatePostBody.content,
      blogId: createdBlogSecondResponseBody.id,
      blogName: createdBlogSecondResponseBody.name,
      createdAt: expect.any(String),
      extendedLikesInfo: {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    });
  });
  it('should delete post', async () => {
    const blogBody = {
      name: 'somename',
      websiteUrl: 'https://www.websiteUrl.com',
      description: 'description',
    };
    const createdBlogResponseBody = await blogsTestManager.createBlog(blogBody);

    const postBody = {
      title: 'string',
      shortDescription: 'string',
      content: 'string',
      blogId: createdBlogResponseBody.id,
    };
    const createdPostResponseBody = await postsTestManager.createPost(postBody);

    await postsTestManager.deletePost(createdPostResponseBody.id);
    await postsTestManager.deletePost(
      createdPostResponseBody.id,
      HttpStatus.NOT_FOUND,
    );
    const getPostByIdResponseBody = await postsTestManager.getPostById(
      createdPostResponseBody.id,
      HttpStatus.NOT_FOUND,
    );

    expect(getPostByIdResponseBody).toEqual({
      errorsMessages: [
        {
          field: 'post',
          message: expect.any(String),
        },
      ],
    });
  });
  it('should create like for existing post', async () => {
    const blogBody = {
      name: 'somename',
      websiteUrl: 'https://www.websiteUrl.com',
      description: 'description',
    };
    const createdBlogResponseBody = await blogsTestManager.createBlog(blogBody);

    const postBody = {
      title: 'string',
      shortDescription: 'string',
      content: 'string',
      blogId: createdBlogResponseBody.id,
    };
    const createdPostResponseBody = await postsTestManager.createPost(postBody);

    const usersAccessTokenBody =
      await userTestManager.createAndLoginSeveralUsers(1);

    const userAccessToken = usersAccessTokenBody[0].accessToken;

    await postsTestManager.makeLike(
      createdPostResponseBody.id,
      LikeStatusEnum.LIKE,
      userAccessToken,
    );
    const getPostByIdUnauthorizedResponseBody =
      await postsTestManager.getPostById(createdPostResponseBody.id);

    expect(getPostByIdUnauthorizedResponseBody.extendedLikesInfo.myStatus).toBe(
      LikeStatusEnum.NONE,
    );

    const getPostByIdAuthorizedResponseBody =
      await postsTestManager.getPostById(
        createdPostResponseBody.id,
        HttpStatus.OK,
        userAccessToken,
      );

    expect(getPostByIdAuthorizedResponseBody.extendedLikesInfo.myStatus).toBe(
      LikeStatusEnum.LIKE,
    );
  });
  it('should return error when try to create like for unexisting post', async () => {
    const usersAccessTokenBody =
      await userTestManager.createAndLoginSeveralUsers(1);

    const userAccessToken = usersAccessTokenBody[0].accessToken;

    await postsTestManager.makeLike(
      '63189b06003380064c4193be',
      LikeStatusEnum.LIKE,
      userAccessToken,
      HttpStatus.NOT_FOUND,
    );
  });
});
