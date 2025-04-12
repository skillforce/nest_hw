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
  it('should show correct extended likes info for different users', async () => {
    const [
      { accessToken: user1AccessToken },
      { accessToken: user2AccessToken },
      { accessToken: user3AccessToken },
    ] = await userTestManager.createAndLoginSeveralUsers(3);

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

    await postsTestManager.makeLike(
      createdPostResponseBody.id,
      LikeStatusEnum.LIKE,
      user1AccessToken,
    );
    await postsTestManager.makeLike(
      createdPostResponseBody.id,
      LikeStatusEnum.LIKE,
      user3AccessToken,
    );
    await postsTestManager.makeLike(
      createdPostResponseBody.id,
      LikeStatusEnum.DISLIKE,
      user2AccessToken,
    );

    const getPostByIdResponseBodyForUser3 = await postsTestManager.getPostById(
      createdPostResponseBody.id,
      HttpStatus.OK,
      user3AccessToken,
    );
    const getPostByIdResponseBodyForUser2 = await postsTestManager.getPostById(
      createdPostResponseBody.id,
      HttpStatus.OK,
      user2AccessToken,
    );
    const getPostByIdResponseBodyForUser1 = await postsTestManager.getPostById(
      createdPostResponseBody.id,
      HttpStatus.OK,
      user1AccessToken,
    );
    const getPostByIdResponseBodyForUnauthorized =
      await postsTestManager.getPostById(
        createdPostResponseBody.id,
        HttpStatus.OK,
      );

    expect(
      getPostByIdResponseBodyForUnauthorized.extendedLikesInfo.myStatus,
    ).toBe(LikeStatusEnum.NONE);
    expect(
      getPostByIdResponseBodyForUnauthorized.extendedLikesInfo.likesCount,
    ).toBe(2);
    expect(
      getPostByIdResponseBodyForUnauthorized.extendedLikesInfo.dislikesCount,
    ).toBe(1);
    expect(getPostByIdResponseBodyForUser1.extendedLikesInfo.myStatus).toBe(
      LikeStatusEnum.LIKE,
    );
    expect(getPostByIdResponseBodyForUser2.extendedLikesInfo.myStatus).toBe(
      LikeStatusEnum.DISLIKE,
    );
    expect(getPostByIdResponseBodyForUser3.extendedLikesInfo.myStatus).toBe(
      LikeStatusEnum.LIKE,
    );

    expect(
      getPostByIdResponseBodyForUnauthorized.extendedLikesInfo.newestLikes,
    ).toHaveLength(2);
  });
  it('should show correct extended likes info for different users when try to get posts array by blog id', async () => {
    const [
      { accessToken: user1AccessToken },
      { accessToken: user2AccessToken },
      { accessToken: user3AccessToken },
    ] = await userTestManager.createAndLoginSeveralUsers(3);

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

    await postsTestManager.makeLike(
      createdPostResponseBody.id,
      LikeStatusEnum.LIKE,
      user1AccessToken,
    );
    await postsTestManager.makeLike(
      createdPostResponseBody.id,
      LikeStatusEnum.LIKE,
      user3AccessToken,
    );
    await postsTestManager.makeLike(
      createdPostResponseBody.id,
      LikeStatusEnum.DISLIKE,
      user2AccessToken,
    );

    const getPostByBlogIdResponseBodyForUser3 =
      await postsTestManager.getPostsByBlogId(
        createdBlogResponseBody.id,
        user3AccessToken,
      );
    const getPostByBlogIdResponseBodyForUser2 =
      await postsTestManager.getPostsByBlogId(
        createdBlogResponseBody.id,
        user2AccessToken,
      );
    const getPostByBlogIdResponseBodyForUser1 =
      await postsTestManager.getPostsByBlogId(
        createdBlogResponseBody.id,
        user1AccessToken,
      );

    const getPostByBlogIdResponseBodyForUnauthorized =
      await postsTestManager.getPostsByBlogId(createdBlogResponseBody.id);

    expect(
      getPostByBlogIdResponseBodyForUnauthorized.items[0].extendedLikesInfo
        .myStatus,
    ).toBe(LikeStatusEnum.NONE);
    expect(
      getPostByBlogIdResponseBodyForUnauthorized.items[0].extendedLikesInfo
        .likesCount,
    ).toBe(2);
    expect(
      getPostByBlogIdResponseBodyForUnauthorized.items[0].extendedLikesInfo
        .dislikesCount,
    ).toBe(1);
    expect(
      getPostByBlogIdResponseBodyForUser1.items[0].extendedLikesInfo.myStatus,
    ).toBe(LikeStatusEnum.LIKE);
    expect(
      getPostByBlogIdResponseBodyForUser2.items[0].extendedLikesInfo.myStatus,
    ).toBe(LikeStatusEnum.DISLIKE);
    expect(
      getPostByBlogIdResponseBodyForUser3.items[0].extendedLikesInfo.myStatus,
    ).toBe(LikeStatusEnum.LIKE);

    expect(
      getPostByBlogIdResponseBodyForUnauthorized.items[0].extendedLikesInfo
        .newestLikes,
    ).toHaveLength(2);
  });
  it('should show correct extended likes info for different users when try to get posts arrayby get all posts request', async () => {
    const [
      { accessToken: user1AccessToken },
      { accessToken: user2AccessToken },
      { accessToken: user3AccessToken },
    ] = await userTestManager.createAndLoginSeveralUsers(3);

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

    await postsTestManager.makeLike(
      createdPostResponseBody.id,
      LikeStatusEnum.LIKE,
      user1AccessToken,
    );
    await postsTestManager.makeLike(
      createdPostResponseBody.id,
      LikeStatusEnum.LIKE,
      user3AccessToken,
    );
    await postsTestManager.makeLike(
      createdPostResponseBody.id,
      LikeStatusEnum.DISLIKE,
      user2AccessToken,
    );

    const getPostByBlogIdResponseBodyForUser3 =
      await postsTestManager.getPosts(user3AccessToken);
    const getPostByBlogIdResponseBodyForUser2 =
      await postsTestManager.getPosts(user2AccessToken);
    const getPostByBlogIdResponseBodyForUser1 =
      await postsTestManager.getPosts(user1AccessToken);

    const getPostByBlogIdResponseBodyForUnauthorized =
      await postsTestManager.getPosts();

    expect(
      getPostByBlogIdResponseBodyForUnauthorized.items[0].extendedLikesInfo
        .myStatus,
    ).toBe(LikeStatusEnum.NONE);
    expect(
      getPostByBlogIdResponseBodyForUnauthorized.items[0].extendedLikesInfo
        .likesCount,
    ).toBe(2);
    expect(
      getPostByBlogIdResponseBodyForUnauthorized.items[0].extendedLikesInfo
        .dislikesCount,
    ).toBe(1);
    expect(
      getPostByBlogIdResponseBodyForUser1.items[0].extendedLikesInfo.myStatus,
    ).toBe(LikeStatusEnum.LIKE);
    expect(
      getPostByBlogIdResponseBodyForUser2.items[0].extendedLikesInfo.myStatus,
    ).toBe(LikeStatusEnum.DISLIKE);
    expect(
      getPostByBlogIdResponseBodyForUser3.items[0].extendedLikesInfo.myStatus,
    ).toBe(LikeStatusEnum.LIKE);

    expect(
      getPostByBlogIdResponseBodyForUnauthorized.items[0].extendedLikesInfo
        .newestLikes,
    ).toHaveLength(2);
  });
});
