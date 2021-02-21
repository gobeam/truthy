import { EntityRepository, Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserLoginDto } from './dto/user-login.dto';
import { UnauthorizedException } from '@nestjs/common';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async store(createUserDto: CreateUserDto): Promise<void> {
    const { name, username, password, email } = createUserDto;
    const user = this.create();
    user.name = name;
    user.username = username;
    user.email = email;
    user.salt = await bcrypt.genSalt();
    user.password = password;
    await user.save();
  }

  async login(userLoginDto: UserLoginDto): Promise<User> {
    const { username, password } = userLoginDto;
    const user = await this.findOne({ username });
    if (user && (await user.validatePassword(password))) {
      return user;
    }
    throw new UnauthorizedException();
  }

  // private async hashPassword(password: string, salt: string): Promise<string> {
  //   return bcrypt.hash(password, salt);
  // }
}
