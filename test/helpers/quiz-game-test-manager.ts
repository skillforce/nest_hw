import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';
import {
  AnswerQuestionViewDto,
  GameSessionViewDto,
} from '../../src/modules/quiz-game/api/dto/game-session-view-dto';
import { GetMyGamesHistoryQueryParamsInputDto } from '../../src/modules/quiz-game/api/dto/get-my-games-history-query-params.input-dto';
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view-dto';

export class GameTestManager {
  constructor(private app: INestApplication) {}

  async connectToGame(
    accessToken: string,
    expectedStatus: number = HttpStatus.OK,
  ): Promise<GameSessionViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/connection`)
      .auth(accessToken, { type: 'bearer' })
      .expect(expectedStatus);

    return response.body as GameSessionViewDto;
  }

  async getMyCurrentGame(
    accessToken: string,
    expectedStatus: number = HttpStatus.OK,
  ): Promise<GameSessionViewDto> {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/my-current`)
      .auth(accessToken, { type: 'bearer' })
      .expect(expectedStatus);

    return response.body as GameSessionViewDto;
  }
  async getMyStatistic(
    accessToken: string,
    expectedStatus: number = HttpStatus.OK,
  ): Promise<GameSessionViewDto> {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/pair-game-quiz/users/my-statistic`)
      .auth(accessToken, { type: 'bearer' })
      .expect(expectedStatus);

    return response.body as GameSessionViewDto;
  }

  async sendAnswer(
    accessToken: string,
    answer: { answer: string },
    expectedStatus: number = HttpStatus.OK,
  ): Promise<AnswerQuestionViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/my-current/answers`)
      .auth(accessToken, { type: 'bearer' })
      .send(answer)
      .expect(expectedStatus);

    return response.body as AnswerQuestionViewDto;
  }

  async getMyGamesHistory(
    accessToken: string,
    query?: Partial<GetMyGamesHistoryQueryParamsInputDto>,
    expectedStatus: HttpStatus = HttpStatus.OK,
  ): Promise<PaginatedViewDto<GameSessionViewDto[]>> {
    const requestBuilder = request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/my`)
      .auth(accessToken, { type: 'bearer' });

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          requestBuilder.query({ [key]: value });
        }
      });
    }

    const response = await requestBuilder.expect(expectedStatus);

    return response.body as PaginatedViewDto<GameSessionViewDto[]>;
  }

  async getGameById(
    accessToken: string,
    gameId: string,
    expectedStatus: number = HttpStatus.OK,
  ): Promise<GameSessionViewDto> {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/pair-game-quiz/pairs/${gameId}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(expectedStatus);

    return response.body as GameSessionViewDto;
  }
}
