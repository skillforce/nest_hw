import { HttpStatus, INestApplication } from '@nestjs/common';
import { QuestionsTestManager } from './helpers/questions-test-manager';
import { initSettings } from './helpers/init-settings';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../src/modules/user-accounts/constants/auth-tokens.inject-contants';
import { UserAccountsConfig } from '../src/modules/user-accounts/config/user-accounts.config';
import { JwtService } from '@nestjs/jwt';
import { deleteAllData } from './helpers/delete-all-data';

describe('Questions Controller (e2e)', () => {
  let app: INestApplication;
  let questionsTestManager: QuestionsTestManager;

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
    questionsTestManager = result.questionsTestManager;
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get paginated response with empty items array', async () => {
    const response = await questionsTestManager.getQuestions();
    expect(response.pagesCount).toBe(0);
    expect(response.items).toEqual([]);
    expect(response.totalCount).toBe(0);
  });

  it('should create question and return created question', async () => {
    const created = await questionsTestManager.createQuestion({
      body: 'What is the capital of France?',
      correctAnswers: ['Paris'],
    });
    console.log(created);
    await questionsTestManager.updateQuestionById(
      {
        body: 'updated123123123!',
        correctAnswers: ['Paris!'],
      },
      +created.id,
    );

    const result = await questionsTestManager.getQuestions(200);
    console.log(result);
    expect(created.id).toBeDefined();
    expect(created.body).toBe('What is the capital of France?');
    expect(created.correctAnswers).toEqual(['Paris']);
    expect(created.published).toBe(false);
    expect(created.createdAt).toBeDefined();
    expect(created.updatedAt).toBeNull();
  });

  it("shouldn't create question when body is empty", async () => {
    await questionsTestManager.createQuestion(
      { body: '', correctAnswers: ['Answer'] },
      HttpStatus.BAD_REQUEST,
    );
  });

  it("shouldn't create question when body is too long", async () => {
    const longBody = 'a'.repeat(501);
    await questionsTestManager.createQuestion(
      { body: longBody, correctAnswers: ['Answer'] },
      HttpStatus.BAD_REQUEST,
    );
  });

  it("shouldn't create question when body is too short", async () => {
    await questionsTestManager.createQuestion(
      { body: 'a', correctAnswers: ['Answer'] },
      HttpStatus.BAD_REQUEST,
    );
  });

  it("shouldn't create question when correctAnswers is empty", async () => {
    await questionsTestManager.createQuestion(
      { body: 'Valid question', correctAnswers: [] },
      HttpStatus.BAD_REQUEST,
    );
  });

  it('should create two questions and when user try to get them should get paginated answer with appropriate items', async () => {
    await questionsTestManager.createQuestion({
      body: 'First question',
      correctAnswers: ['A'],
    });
    await questionsTestManager.createQuestion({
      body: 'Second question',
      correctAnswers: ['B'],
    });

    const result = await questionsTestManager.getQuestions();
    expect(result.totalCount).toBe(2);
    expect(result.items.length).toBe(2);
    const bodies = result.items.map((q) => q.body);
    expect(bodies).toContain('First question');
    expect(bodies).toContain('Second question');
  });

  it("shouldn't delete question when user try to delete non existing question", async () => {
    await questionsTestManager.deleteQuestion(12345, HttpStatus.NOT_FOUND);
  });

  it('should delete question when user try to delete existing question', async () => {
    const created = await questionsTestManager.createQuestion({
      body: 'Delete me1234',
      correctAnswers: ['Answer'],
    });

    await questionsTestManager.deleteQuestion(+created.id);

    const result = await questionsTestManager.getQuestions();
    expect(result.items.find((q) => q.id === created.id)).toBeUndefined();
  });

  it("shouldn't update question when user try to update non existing question", async () => {
    await questionsTestManager.updateQuestionById(
      {
        body: 'Updated body',
        correctAnswers: ['New answer'],
      },
      12345,
      HttpStatus.NOT_FOUND,
    );
  });

  it('should update question when user try to update existing question', async () => {
    const created = await questionsTestManager.createQuestion({
      body: 'Original body',
      correctAnswers: ['Old answer'],
    });

    await questionsTestManager.updateQuestionById(
      {
        body: 'Updated body',
        correctAnswers: ['New answer'],
      },
      +created.id,
    );

    const result = await questionsTestManager.getQuestions();
    const updated = result.items.find((q) => q.id === created.id);
    expect(updated?.body).toBe('Updated body');
    expect(updated?.correctAnswers).toEqual(['New answer']);
  });

  it("shouldn't publish question when user try to publish non existing question", async () => {
    await questionsTestManager.publishQuestionById(
      true,
      12345,
      HttpStatus.NOT_FOUND,
    );
  });

  it('should publish question when user try to publish existing question', async () => {
    const created = await questionsTestManager.createQuestion({
      body: 'Publish me',
      correctAnswers: ['Yes'],
    });

    await questionsTestManager.publishQuestionById(true, +created.id);

    const result = await questionsTestManager.getQuestions();
    const published = result.items.find((q) => q.id === created.id);
    expect(published?.published).toBe(true);
  });

  it("shouldn't unpublish question when user try to unpublish non existing question", async () => {
    await questionsTestManager.publishQuestionById(
      false,
      12345,
      HttpStatus.NOT_FOUND,
    );
  });

  it('should unpublish question when user try to unpublish existing question', async () => {
    const created = await questionsTestManager.createQuestion({
      body: 'Unpublish me',
      correctAnswers: ['Yes'],
    });

    await questionsTestManager.publishQuestionById(true, +created.id);
    await questionsTestManager.publishQuestionById(false, +created.id);

    const result = await questionsTestManager.getQuestions();
    const unpublished = result.items.find((q) => q.id === created.id);
    expect(unpublished?.published).toBe(false);
  });
});
