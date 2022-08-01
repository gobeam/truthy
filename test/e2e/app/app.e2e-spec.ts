import * as request from 'supertest';

import { AppFactory } from 'test/factories/app';

describe('AppController (e2e)', () => {
  let app: AppFactory;

  beforeAll(async () => {
    await AppFactory.dropTables();
    app = await AppFactory.new();
  });

  beforeEach(async () => {
    await AppFactory.cleanupDB();
  });

  it('/ (GET)', () => {
    return request(app.instance.getHttpServer())
      .get('/')
      .expect(200)
      .expect({ message: 'hello world' });
  });

  afterAll(async () => {
    await app.close();
  });
});
