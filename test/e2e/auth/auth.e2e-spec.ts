import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';

import { AppFactory } from 'test/factories/app';
import { RoleFactory } from 'test/factories/role.factory';
import { UserFactory } from 'test/factories/user.factory';
import { extractCookies } from 'test/utility/extract-cookie';

describe('AuthController (e2e)', () => {
  let app: AppFactory;

  beforeAll(async () => {
    await AppFactory.dropTables();
    app = await AppFactory.new();
  });

  beforeEach(async () => {
    await AppFactory.cleanupDB();
  });

  it('POST /auth/login requires valid username and password', async () => {
    await request(app.instance.getHttpServer())
      .post(`/auth/login`)
      .send({
        username: 'email'
      })
      .expect(HttpStatus.UNPROCESSABLE_ENTITY);
  });

  it('POST /auth/login should throw unauthorized error if wrong username and password provided', async () => {
    await request(app.instance.getHttpServer())
      .post(`/auth/login`)
      .send({
        username: 'john@example.com',
        password: 'wrongPassword',
        remember: true
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('POST /auth/login should login if provided with valid username and password', async () => {
    let cookie;
    const role = await RoleFactory.new().create();
    const user = await UserFactory.new()
      .withRole(role)
      .create({ password: 'password' });

    await request(app.instance.getHttpServer())
      .post(`/auth/login`)
      .send({
        username: user.email,
        password: 'password',
        remember: true
      })
      .expect(HttpStatus.NO_CONTENT)
      .then((res) => {
        cookie = extractCookies(res.headers);
      });
    expect(cookie).toBeDefined();
    expect(cookie).toHaveProperty('Authentication');
    expect(cookie).toHaveProperty('Refresh');
    expect(cookie).toHaveProperty('ExpiresIn');
  });

  afterAll(async () => {
    await app.close();
  });
});
