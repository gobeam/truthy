import { AppFactory } from 'test/factories/app';

describe('Example Test (e2e)', () => {
  let app: AppFactory;

  beforeAll(async () => {
    app = await AppFactory.new();
  });

  beforeEach(async () => {
    await app.refreshDatabase();
  });

  it('it passes', async () => {
    expect(true).toBe(true);
  });

  afterAll(async () => {
    await app.close();
  });
});
