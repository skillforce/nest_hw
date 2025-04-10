import { INestApplication } from '@nestjs/common';
import request, { Request } from 'supertest';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';

export const deleteAllData = async (
  app: INestApplication,
): Promise<Request> => {
  return request(app.getHttpServer()).delete(`/api/testing/all-data`);
};
