import { INestApplication } from '@nestjs/common';
import request, { Request } from 'supertest';

export const deleteAllData = async (
  app: INestApplication,
): Promise<Request> => {
  return request(app.getHttpServer()).delete(`/api/testing/all-data`);
};
