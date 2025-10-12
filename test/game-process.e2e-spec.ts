import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import { UsersTestManager } from './helpers/users-test-manager';
import { QuestionsTestManager } from './helpers/questions-test-manager';
import { delay } from './helpers/delay';
import { GameTestManager } from './helpers/quiz-game-test-manager';
import { CreateQuestionInputDto } from '../src/modules/quiz-game/api/dto/question-input-dto';

describe('Game Process (e2e)', () => {
  let app: INestApplication;
  let usersTestManager: UsersTestManager;
  let gameTestManager: GameTestManager;
  let questionsTestManager: QuestionsTestManager;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
    usersTestManager = result.userTestManager;
    gameTestManager = result.gameTestManager;
    questionsTestManager = result.questionsTestManager;
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create questions, two users connect to game, answer, and finish the game', async () => {
    // --- Step 1: Create & publish 5 questions
    const questions: CreateQuestionInputDto[] = [
      {
        body: 'What is the sum of two and two in simple arithmetic?',
        correctAnswers: ['4', 'four'],
      },
      {
        body: 'In basic math, what number do you get when adding three plus three?',
        correctAnswers: ['6'],
      },
      {
        body: 'Name the European city that serves as the capital of France.',
        correctAnswers: ['Paris'],
      },
      {
        body: 'At what temperature in Celsius does water start to freeze?',
        correctAnswers: ['0', 'zero'],
      },
      {
        body: 'If you multiply five by five, what number will you get as a result?',
        correctAnswers: ['25'],
      },
    ];

    for (const q of questions) {
      const created = await questionsTestManager.createQuestion(q);
      await questionsTestManager.publishQuestionById(true, +created.id);
    }

    // --- Step 2: Create and login 2 users
    const users = await usersTestManager.createAndLoginSeveralUsers(2);
    const [user1, user2] = users;

    // --- Step 3: User1 connects (game pending)
    const pendingGame = await gameTestManager.connectToGame(user1.accessToken);
    expect(pendingGame.status).toBe('PendingSecondPlayer');

    // --- Step 4: User2 connects (game becomes active)
    const activeGame = await gameTestManager.connectToGame(user2.accessToken);
    expect(activeGame.status).toBe('Active');
    expect(activeGame.firstPlayerProgress.player.id).not.toBe(
      activeGame.secondPlayerProgress?.player.id,
    );

    // --- Step 5: User1 and User2 answer alternately
    for (let i = 0; i < 5; i++) {
      await gameTestManager.sendAnswer(user1.accessToken, {
        answer: questions[i].correctAnswers[0],
      });
      await delay(50);
      await gameTestManager.sendAnswer(user2.accessToken, {
        answer: questions[i].correctAnswers[0],
      });
    }

    // --- Step 6: Verify both users’ current game status
    const game1 = await gameTestManager.getMyCurrentGame(user1.accessToken);
    const game2 = await gameTestManager.getMyCurrentGame(user2.accessToken);

    expect(game1.id).toBe(game2.id);
    expect(['Active', 'Finished']).toContain(game1.status);

    // --- Step 7: Wait a bit for finalization and check finished state
    await delay(500);
    const finishedGame = await gameTestManager.getGameById(
      user1.accessToken,
      game1.id,
    );

    expect(finishedGame.status).toBe('Finished');
    expect(finishedGame.firstPlayerProgress.answers).toHaveLength(5);
    expect(finishedGame.secondPlayerProgress?.answers).toHaveLength(5);
  });

  it('should return 401 when user tries to connect without token', async () => {
    await gameTestManager.connectToGame('', HttpStatus.UNAUTHORIZED);
  });

  it('should return 401 when user tries to answer with invalid token', async () => {
    await gameTestManager.sendAnswer(
      'invalid-token',
      { answer: 'anything' },
      HttpStatus.UNAUTHORIZED,
    );
  });
});
