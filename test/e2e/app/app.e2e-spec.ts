import request from 'supertest';

import { AppFactory } from 'test/factories/app';

describe('AppController (e2e)', () => {
  let app: AppFactory;

  beforeAll(async () => {
    app = await AppFactory.new();
    await app.cleanupDbTable();
  });

  beforeEach(async () => {
    await app.cleanupDbTable();
  });

  it('/ (GET)', () => {
    return request(app.instance.getHttpServer())
      .get('/')
      .expect(200)
      .expect({ message: 'hello world' });
  });

  afterAll(async () => {
    if (app) await app.close();
  });
});
