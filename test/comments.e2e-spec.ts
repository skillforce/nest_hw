import { HttpStatus, INestApplication } from '@nestjs/common';
import { PostsTestManager } from './helpers/posts-test-manager';
import { BlogsTestManager } from './helpers/blogs-test-manager';
import { UsersTestManager } from './helpers/users-test-manager';
import { CommentsTestManager } from './helpers/comments-test-manager';
import { initSettings } from './helpers/init-settings';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../src/modules/user-accounts/constants/auth-tokens.inject-contants';
import { UserAccountsConfig } from '../src/modules/user-accounts/config/user-accounts.config';
import { JwtService } from '@nestjs/jwt';
import { deleteAllData } from './helpers/delete-all-data';
import { LikeStatusEnum } from '../src/modules/bloggers-platform/domain/dto/like-domain.dto';

describe('Comments Controller (e2e)', () => {
  let app: INestApplication;
  let postsTestManager: PostsTestManager;
  let blogsTestManager: BlogsTestManager;
  let userTestManager: UsersTestManager;
  let commentsTestManager: CommentsTestManager;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      moduleBuilder
        .overrideProvider(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
        .useFactory({
          factory: (userAccountsConfig: UserAccountsConfig) =>
            new JwtService({
              secret: userAccountsConfig.accessTokenSecret,
              signOptions: {
                expiresIn: userAccountsConfig.accessTokenExpireIn,
              },
            }),
          inject: [UserAccountsConfig],
        }),
    );

    app = result.app;
    postsTestManager = result.postsTestManager;
    blogsTestManager = result.blogsTestManager;
    userTestManager = result.userTestManager;
    commentsTestManager = result.commentsTestManager;
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return error if user try to get comments for not existing post', async () => {
    const [{ accessToken }] =
      await userTestManager.createAndLoginSeveralUsers(1);

    await commentsTestManager.getCommentsByPostId(
      123456,
      accessToken,
      HttpStatus.NOT_FOUND,
    );
  });

  it('should return error if user try to create comment for not existing post', async () => {
    const [{ accessToken }] =
      await userTestManager.createAndLoginSeveralUsers(1);

    const createCommentBody = {
      content: 'Nice post content lalalalalalaldddddddd!',
    };
    await commentsTestManager.createComment(
      123456,
      createCommentBody,
      accessToken,
      HttpStatus.NOT_FOUND,
    );
  });

  it('should create comment for existing post', async () => {
    const { id: blogId } = await blogsTestManager.createBlog({
      name: 'Blog',
      websiteUrl: 'https://example.com',
      description: 'desc',
    });

    const { id: postId } = await postsTestManager.createPost({
      title: 'Post',
      shortDescription: 'Short desc',
      content: 'Content',
      blogId: +blogId,
    });

    const [{ accessToken }] =
      await userTestManager.createAndLoginSeveralUsers(1);

    const createCommentBody = {
      content: 'Nice post content lalalalalalaldddddddd!',
    };
    const createdComment = await commentsTestManager.createComment(
      +postId,
      createCommentBody,
      accessToken,
    );

    expect(createdComment).toEqual({
      id: expect.any(String),
      content: createCommentBody.content,
      commentatorInfo: {
        userId: expect.any(String),
        userLogin: expect.any(String),
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatusEnum.NONE,
      },
    });
  });

  it('should update comment by owner', async () => {
    const [user] = await userTestManager.createAndLoginSeveralUsers(1);

    const { id: blogId } = await blogsTestManager.createBlog({
      name: 'Blog',
      websiteUrl: 'https://example.com',
      description: 'desc',
    });

    const { id: postId } = await postsTestManager.createPost({
      title: 'Post',
      shortDescription: 'Short desc',
      content: 'Content',
      blogId: +blogId,
    });

    const { id: commentId } = await commentsTestManager.createComment(
      +postId,
      { content: 'Some comment content lalalalalalaldddddddd!sss' },
      user.accessToken,
    );

    const updatedContent = { content: 'Updated comment122222222222222222fvdf' };
    await commentsTestManager.updateComment(
      commentId,
      updatedContent,
      user.accessToken,
    );

    const updatedComment = await commentsTestManager.getCommentById(commentId);

    expect(updatedComment.content).toBe(updatedContent.content);
  });

  it('should not allow unauthorized user to update comment', async () => {
    const [user1, user2] = await userTestManager.createAndLoginSeveralUsers(2);

    const { id: blogId } = await blogsTestManager.createBlog({
      name: 'Blog',
      websiteUrl: 'https://example.com',
      description: 'desc',
    });

    const { id: postId } = await postsTestManager.createPost({
      title: 'Post',
      shortDescription: 'Short desc',
      content: 'Content',
      blogId: +blogId,
    });

    const { id: commentId } = await commentsTestManager.createComment(
      +postId,
      { content: 'Some commentcontent lalalalalalaldddddddd!ssss' },
      user1.accessToken,
    );

    await commentsTestManager.updateComment(
      commentId,
      { content: 'Hacked content content lalalalalalaldddddddd!sss' },
      user2.accessToken,
      HttpStatus.FORBIDDEN,
    );
  });

  it('should delete comment by owner', async () => {
    const [user] = await userTestManager.createAndLoginSeveralUsers(1);

    const { id: blogId } = await blogsTestManager.createBlog({
      name: 'Blog',
      websiteUrl: 'https://example.com',
      description: 'desc',
    });

    const { id: postId } = await postsTestManager.createPost({
      title: 'Post',
      shortDescription: 'Short desc',
      content: 'Content',
      blogId: +blogId,
    });

    const { id: commentId } = await commentsTestManager.createComment(
      +postId,
      { content: 'Some comment content lalalalalalaldddddddd!ssssssw' },
      user.accessToken,
    );

    await commentsTestManager.deleteComment(commentId, user.accessToken);
    await commentsTestManager.getCommentById(
      commentId,
      undefined,
      HttpStatus.NOT_FOUND,
    );
  });

  it('should create like for comment', async () => {
    const [user] = await userTestManager.createAndLoginSeveralUsers(1);

    const { id: blogId } = await blogsTestManager.createBlog({
      name: 'Blog',
      websiteUrl: 'https://example.com',
      description: 'desc',
    });

    const { id: postId } = await postsTestManager.createPost({
      title: 'Post',
      shortDescription: 'Short desc',
      content: 'Content',
      blogId: +blogId,
    });

    const { id: commentId } = await commentsTestManager.createComment(
      +postId,
      { content: 'Interesting scontent lalalalalalaldddddddd!sssssss' },
      user.accessToken,
    );

    await commentsTestManager.likeComment(
      commentId,
      LikeStatusEnum.LIKE,
      user.accessToken,
    );

    const comment = await commentsTestManager.getCommentById(
      commentId,
      user.accessToken,
      HttpStatus.OK,
    );
    expect(comment.likesInfo.likesCount).toBe(1);
    expect(comment.likesInfo.myStatus).toBe(LikeStatusEnum.LIKE);
  });
});
