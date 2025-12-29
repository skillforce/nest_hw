import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view-dto';
import {
  CreateQuestionInputDto,
  UpdateQuestionByIdInputDto,
} from '../../src/modules/quiz-game/api/dto/question-input-dto';
import { QuestionViewDto } from '../../src/modules/quiz-game/api/dto/question-view-dto';

const questionControllerPrefix = `/${GLOBAL_PREFIX}/sa/quiz/questions`;

export class QuestionsTestManager {
  constructor(private app: INestApplication) {}

  async createQuestion(
    createModel: CreateQuestionInputDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<QuestionViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(`${questionControllerPrefix}`)
      .auth('admin', 'qwerty')
      .send(createModel)
      .expect(statusCode);

    return response.body;
  }

  async getQuestions(
    statusCode: number = HttpStatus.OK,
  ): Promise<PaginatedViewDto<QuestionViewDto[]>> {
    const response = await request(this.app.getHttpServer())
      .get(`${questionControllerPrefix}`)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response.body;
  }

  async updateQuestionById(
    body: UpdateQuestionByIdInputDto,
    questionId: number,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<any> {
    const response = await request(this.app.getHttpServer())
      .put(`${questionControllerPrefix}/${questionId}`)
      .auth('admin', 'qwerty')
      .send(body)
      .expect(statusCode);
    return response.body;
  }
  async publishQuestionById(
    isPublished: boolean,
    questionId: number,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<any> {
    const response = await request(this.app.getHttpServer())
      .put(`${questionControllerPrefix}/${questionId}/publish`)
      .auth('admin', 'qwerty')
      .send({ published: isPublished })
      .expect(statusCode);
    return response.body;
  }

  async createAndPublishFiveQuestions(): Promise<void> {
    const questions: CreateQuestionInputDto[] = [
      {
        body: 'What is the sum of two and two in simple arithmetic?',
        correctAnswers: ['4', 'four', 'right'],
      },
      {
        body: 'In basic math, what number do you get when adding three plus three?',
        correctAnswers: ['6', 'right'],
      },
      {
        body: 'Name the European city that serves as the capital of France.',
        correctAnswers: ['Paris', 'right'],
      },
      {
        body: 'At what temperature in Celsius does water start to freeze?',
        correctAnswers: ['0', 'four', 'right'],
      },
      {
        body: 'If you multiply five by five, what number will you get as a result?',
        correctAnswers: ['25', 'right'],
      },
    ];

    for (const q of questions) {
      const created = await this.createQuestion(q);
      await this.publishQuestionById(true, +created.id);
    }
  }

  async deleteQuestion(
    questionId: number,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.app.getHttpServer())
      .delete(`${questionControllerPrefix}/${questionId}`)
      .auth('admin', 'qwerty')
      .expect(statusCode);
  }
}
