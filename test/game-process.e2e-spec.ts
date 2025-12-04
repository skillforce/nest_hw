import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import { UsersTestManager } from './helpers/users-test-manager';
import { QuestionsTestManager } from './helpers/questions-test-manager';
import { delay } from './helpers/delay';
import { GameTestManager } from './helpers/quiz-game-test-manager';

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
    await questionsTestManager.createAndPublishFiveQuestions();

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
        answer: '25',
      });
      await delay(200);
      await gameTestManager.sendAnswer(user2.accessToken, {
        answer: 'four',
      });
    }

    console.log('Both users have answered all questions.');
    const finishedGame = await gameTestManager.getGameById(
      user1.accessToken,
      activeGame.id,
    );
    console.log(finishedGame);

    expect(finishedGame.status).toBe('Finished');
    expect(finishedGame.firstPlayerProgress.answers).toHaveLength(5);
    expect(finishedGame.secondPlayerProgress?.answers).toHaveLength(5);
  });

  it('should return 403 if user tries to connect again while already in active/pending game', async () => {
    await questionsTestManager.createAndPublishFiveQuestions();

    // Create & login 1 user
    const [user1] = await usersTestManager.createAndLoginSeveralUsers(1);

    // Step 1: user1 connects → pending game
    const pendingGame = await gameTestManager.connectToGame(user1.accessToken);
    expect(pendingGame.status).toBe('PendingSecondPlayer');

    // Step 2: user1 tries to connect again → 403
    await gameTestManager.connectToGame(
      user1.accessToken,
      HttpStatus.FORBIDDEN,
    );
  });
  it('should return 403 if user tries to answer in a game they are not a participant of', async () => {
    await questionsTestManager.createAndPublishFiveQuestions();

    // Create & login 3 users
    const [user1, user2, user3] =
      await usersTestManager.createAndLoginSeveralUsers(3);

    // Step 1: user1 connects → pending
    const pending = await gameTestManager.connectToGame(user1.accessToken);
    expect(pending.status).toBe('PendingSecondPlayer');

    // Step 2: user2 connects → active game
    const active = await gameTestManager.connectToGame(user2.accessToken);
    expect(active.status).toBe('Active');

    // Step 3: user3 tries to answer → 403
    await gameTestManager.sendAnswer(
      user3.accessToken,
      { answer: 'hello' },
      HttpStatus.FORBIDDEN,
    );
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
