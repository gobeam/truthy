import { AppFactory } from 'test/factories/app';

describe('Example Test (e2e)', () => {
  let app: AppFactory;

  beforeAll(async () => {
    await AppFactory.dropTables();
    app = await AppFactory.new();
  });

  beforeEach(async () => {
    await AppFactory.cleanupDB();
  });

  it('it passes', async () => {
    expect(true).toBe(true);
  });

  afterAll(async () => {
    await app.close();
  });
});
