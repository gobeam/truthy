import * as bcrypt from 'bcrypt';

import { UserEntity } from 'src/auth/entity/user.entity';

describe('test validate password', () => {
  let user: UserEntity;
  beforeEach(async () => {
    user = new UserEntity();
    user.password = 'testPassword';
    user.salt = 'testSalt';
    bcrypt.hash = jest.fn();
  });
  it('validate password if password matches', async () => {
    bcrypt.hash.mockResolvedValue('testPassword');
    const check = await user.validatePassword('123456');
    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 'testSalt');
    expect(check).toBeTruthy();
  });
  it('validate password if password dont matches', async () => {
    bcrypt.hash.mockResolvedValue('anotherPassword');
    const check = await user.validatePassword('123456');
    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 'testSalt');
    expect(check).toBeFalsy();
  });
});
