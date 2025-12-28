import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import { UsersTestManager } from './helpers/users-test-manager';
import { QuestionsTestManager } from './helpers/questions-test-manager';
import { delay } from './helpers/delay';
import { GameTestManager } from './helpers/quiz-game-test-manager';
import { SortDirection } from '../src/core/dto/base.query-params.input-dto';
import { GetMyGamesHistorySortBy } from '../src/modules/quiz-game/api/dto/get-my-games-history-query-params.input-dto';

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
    const users = await usersTestManager.createAndLoginSeveralUsers(1);
    const [user1] = users;

    await gameTestManager.getMyCurrentGame(
      user1.accessToken,
      HttpStatus.NOT_FOUND,
    ); // 404
  });

  it('should create questions, two users connect to game, answer, and finish the game', async () => {
    // --- Step 1: Create & publish 5 questions
    await questionsTestManager.createAndPublishFiveQuestions();

    // --- Step 2: Create and login 2 users
    const users = await usersTestManager.createAndLoginSeveralUsers(3);
    const [user1, user2, user3] = users;

    // --- Step 3: User1 connects (game pending)
    const pendingGame = await gameTestManager.connectToGame(user1.accessToken);
    expect(pendingGame.status).toBe('PendingSecondPlayer');

    // --- Step 4: User2 connects (game becomes active)
    const activeGame = await gameTestManager.connectToGame(user2.accessToken);
    expect(activeGame.status).toBe('Active');
    expect(activeGame.firstPlayerProgress.player.id).not.toBe(
      activeGame.secondPlayerProgress?.player.id,
    );

    await gameTestManager.getMyCurrentGame(
      user3.accessToken,
      HttpStatus.NOT_FOUND,
    ); // 404

    // --- Step 5: User1 and User2 answer alternately
    for (let i = 0; i < 5; i++) {
      await gameTestManager.sendAnswer(user1.accessToken, {
        answer: '25',
      });
      await delay(203);
      await gameTestManager.sendAnswer(user2.accessToken, {
        answer: 'four',
      });
    }

    await gameTestManager.getMyCurrentGame(
      user1.accessToken,
      HttpStatus.NOT_FOUND,
    ); // 404
    await gameTestManager.getMyCurrentGame(
      user2.accessToken,
      HttpStatus.NOT_FOUND,
    );

    const finishedGame = await gameTestManager.getGameById(
      user1.accessToken,
      activeGame.id,
    );
    console.log(finishedGame.status);

    expect(finishedGame.status).toBe('Finished');
    expect(finishedGame.firstPlayerProgress.answers).toHaveLength(5);
    expect(finishedGame.secondPlayerProgress?.answers).toHaveLength(5);
  });
  it('should return 403 if user tries answer question not from active pair', async () => {
    // Arrange: create & publish required 5 questions
    await questionsTestManager.createAndPublishFiveQuestions();

    // Create & login two users
    const [user1, user2, user3] =
      await usersTestManager.createAndLoginSeveralUsers(3);

    // User1 connects → creates pending game
    const pendingGame = await gameTestManager.connectToGame(user1.accessToken);
    expect(pendingGame.status).toBe('PendingSecondPlayer');
    const activeGame = await gameTestManager.connectToGame(user2.accessToken);
    expect(activeGame.status).toBe('Active');

    // User2 does NOT connect → he is NOT in any active/pending game

    // User2 tries to answer → must get 403
    await gameTestManager.sendAnswer(
      user3.accessToken,
      { answer: 'test' },
      HttpStatus.FORBIDDEN, // 403
    );
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
  it('should create game and connect both users', async () => {
    await questionsTestManager.createAndPublishFiveQuestions();

    // Create & login 1 user
    const [user1, user2] = await usersTestManager.createAndLoginSeveralUsers(2);

    // Step 1: user1 connects → pending game
    const pendingGame = await gameTestManager.connectToGame(user1.accessToken);
    expect(pendingGame.status).toBe('PendingSecondPlayer');
    expect(pendingGame.secondPlayerProgress).toBeNull();

    const activeGame = await gameTestManager.connectToGame(user2.accessToken);
    expect(activeGame.status).toBe('Active');
    expect(activeGame.firstPlayerProgress.player.id).not.toBe(
      activeGame.secondPlayerProgress?.player.id,
    );
    expect(activeGame.secondPlayerProgress?.player.id).toBeDefined();
  });
  it('should return 403 if user tries to answer in a game they are not a participant of', async () => {
    await questionsTestManager.createAndPublishFiveQuestions();

    // Create & login 3 users
    const [user1, user2, user3] =
      await usersTestManager.createAndLoginSeveralUsers(3);

    // Step 1: user1 connects → pending
    const pending = await gameTestManager.connectToGame(user1.accessToken);
    expect(pending.status).toBe('PendingSecondPlayer');
    await gameTestManager.sendAnswer(
      user1.accessToken,
      { answer: 'hello' },
      HttpStatus.FORBIDDEN,
    );

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

  it('should process sequential answers from both players and allow checking my-current after each answer', async () => {
    // --- Step 1: create & publish 5 questions
    await questionsTestManager.createAndPublishFiveQuestions();

    // --- Step 2: create & login 2 users
    const [user1, user2] = await usersTestManager.createAndLoginSeveralUsers(2);

    // --- Step 3: user1 connects → pending
    const pending = await gameTestManager.connectToGame(user1.accessToken);
    expect(pending.status).toBe('PendingSecondPlayer');

    // --- Step 4: user2 connects → active game
    const active = await gameTestManager.connectToGame(user2.accessToken);
    expect(active.status).toBe('Active');

    const gameId = active.id;

    async function expectMyCurrentOk(u: string) {
      const current = await gameTestManager.getMyCurrentGame(u);
      expect(current.status).toBe('Active');
      expect(current.id).toBe(gameId);
      return current;
    }

    // --- ACTION 1: user1 gives correct answer
    await gameTestManager.sendAnswer(user1.accessToken, { answer: 'four' });
    const after1User1 = await expectMyCurrentOk(user1.accessToken);

    expect(after1User1.firstPlayerProgress.answers.length).toBe(1);
    expect(after1User1?.secondPlayerProgress?.answers.length).toBe(0);

    // --- ACTION 2: user2 gives incorrect answer
    await gameTestManager.sendAnswer(user2.accessToken, { answer: 'wrong' });
    const after2User1 = await expectMyCurrentOk(user1.accessToken);

    expect(after2User1.firstPlayerProgress.answers.length).toBe(1);
    expect(after2User1.secondPlayerProgress?.answers.length).toBe(1);

    // --- ACTION 3: user2 gives correct answer
    await gameTestManager.sendAnswer(user2.accessToken, { answer: 'correct' });
    const after3User1 = await expectMyCurrentOk(user1.accessToken);

    expect(after3User1.firstPlayerProgress.answers.length).toBe(1);
    expect(after3User1.secondPlayerProgress?.answers.length).toBe(2);

    // Ensure the game is still active at this point
    const finalGame = await gameTestManager.getGameById(
      user1.accessToken,
      gameId,
    );
    console.log(finalGame.questions);
    console.log(JSON.stringify(finalGame.firstPlayerProgress.answers));
    console.log(JSON.stringify(finalGame.secondPlayerProgress?.answers));
    expect(finalGame.status).toBe('Active');
  });
  it('HW25: should return 404 if user has no active game when calling GET /pair-game-quiz/pairs/my-current', async () => {
    // Clean DB
    await deleteAllData(app);

    // Create & publish 5 questions
    await questionsTestManager.createAndPublishFiveQuestions();

    // Create & login 1 user
    const [user] = await usersTestManager.createAndLoginSeveralUsers(1);

    // User DID NOT create and DID NOT join any game
    // → must return 404
    await gameTestManager.getMyCurrentGame(
      user.accessToken,
      HttpStatus.NOT_FOUND,
    );
  });
  it('GET /pairs/my → should return 401 without token', async () => {
    await gameTestManager.getMyGamesHistory(
      '',
      undefined,
      HttpStatus.UNAUTHORIZED,
    );
  });
  it('GET /pairs/my → should return empty history if user has no finished games', async () => {
    await questionsTestManager.createAndPublishFiveQuestions();
    const [user] = await usersTestManager.createAndLoginSeveralUsers(1);

    const result = await gameTestManager.getMyGamesHistory(user.accessToken);

    expect(result.totalCount).toBe(0);
    expect(result.items).toHaveLength(0);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
  });

  it('GET /pairs/my → should return paginated result', async () => {
    await questionsTestManager.createAndPublishFiveQuestions();
    const [user1, user2] = await usersTestManager.createAndLoginSeveralUsers(2);
    await gameTestManager.connectToGame(user1.accessToken);
    await delay(250);
    await gameTestManager.connectToGame(user2.accessToken);
    for (let i = 0; i < 5; i++) {
      await gameTestManager.sendAnswer(user1.accessToken, { answer: 'four' });
      await delay(150);
      await gameTestManager.sendAnswer(user2.accessToken, {
        answer: 'wrong',
      });
    }

    const page1 = await gameTestManager.getMyGamesHistory(user1.accessToken, {
      pageNumber: 1,
      pageSize: 2,
    });

    expect(page1.items).toHaveLength(1);
    expect(page1.totalCount).toBe(1);

    const page2 = await gameTestManager.getMyGamesHistory(user1.accessToken, {
      pageNumber: 2,
      pageSize: 2,
    });

    expect(page2.items).toHaveLength(0);
  });

  it('GET /pairs/my → should return all games including current', async () => {
    await questionsTestManager.createAndPublishFiveQuestions();
    const [user1, user2] = await usersTestManager.createAndLoginSeveralUsers(2);

    // 1️⃣ Pending game
    const pending = await gameTestManager.connectToGame(user1.accessToken);
    expect(pending.status).toBe('PendingSecondPlayer');

    let history = await gameTestManager.getMyGamesHistory(user1.accessToken);
    expect(history.totalCount).toBe(0);

    // 2️⃣ Active game
    await gameTestManager.connectToGame(user2.accessToken);

    history = await gameTestManager.getMyGamesHistory(user1.accessToken);
    expect(history.totalCount).toBe(1);
    expect(history.items[0].status).toBe('Active');

    // 3️⃣ Finish game
    for (let i = 0; i < 5; i++) {
      await gameTestManager.sendAnswer(user1.accessToken, { answer: 'four' });
      await delay(250);
      await gameTestManager.sendAnswer(user2.accessToken, { answer: 'wrong' });
    }

    history = await gameTestManager.getMyGamesHistory(user1.accessToken);
    expect(history.totalCount).toBe(1);

    const game = history.items[0];
    expect(game.status).toBe('Finished');
    expect(game.finishGameDate).toBeDefined();
  });
  it('GET /pairs/my → should include active game while my-current exists', async () => {
    await questionsTestManager.createAndPublishFiveQuestions();
    const [user1, user2] = await usersTestManager.createAndLoginSeveralUsers(2);

    await gameTestManager.connectToGame(user1.accessToken);
    await gameTestManager.connectToGame(user2.accessToken);

    const current = await gameTestManager.getMyCurrentGame(user1.accessToken);
    console.log(current);
    const history = await gameTestManager.getMyGamesHistory(user1.accessToken);
    console.log(history);

    expect(history.items.some((g) => g.id === current.id)).toBe(true);
  });
  it('GET statistics', async () => {
    await questionsTestManager.createAndPublishFiveQuestions();
    const [user1, user2] = await usersTestManager.createAndLoginSeveralUsers(2);

    await gameTestManager.connectToGame(user1.accessToken);
    await gameTestManager.connectToGame(user2.accessToken);

    const currentStatistics = await gameTestManager.getMyStatistic(
      user1.accessToken,
    );
    console.log(currentStatistics);
  });
});
