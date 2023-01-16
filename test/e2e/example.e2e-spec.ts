import { AppFactory } from 'test/factories/app';

describe('Example Test (e2e)', () => {
  let app: AppFactory;

  beforeAll(async () => {
    app = await AppFactory.new();
    await app.cleanupDbTable();
  });

  beforeEach(async () => {
    await app.cleanupDbTable();
  });

  it('it passes', async () => {
    expect(true).toBe(true);
  });

  afterAll(async () => {
    if (app) await app.close();
  });
});
