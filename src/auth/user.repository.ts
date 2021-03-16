import { EntityRepository } from 'typeorm';
import { UserEntity } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserLoginDto } from './dto/user-login.dto';
import { UnauthorizedException } from '@nestjs/common';
import { BaseRepository } from '../common/repository/base.repository';
import { UserSerializer } from './serializer/user.serializer';
import { classToPlain, plainToClass } from 'class-transformer';

@EntityRepository(UserEntity)
export class UserRepository extends BaseRepository<UserEntity, UserSerializer> {
  /**
   * store new user
   * @param createUserDto
   */
  async store(createUserDto: CreateUserDto): Promise<void> {
    const { name, username, password, email } = createUserDto;
    const user = this.create();
    user.name = name;
    user.username = username;
    user.email = email;
    user.salt = await bcrypt.genSalt();
    user.password = password;
    user.roleId = 1;
    await user.save();
  }

  /**
   * login user
   * @param userLoginDto
   */
  async login(userLoginDto: UserLoginDto): Promise<UserEntity> {
    const { username, password } = userLoginDto;
    const user = await this.findOne({ username });
    if (user && (await user.validatePassword(password))) {
      return user;
    }
    throw new UnauthorizedException();
  }

  /**
   * transform user
   * @param model
   * @param transformOption
   */
  transform(model: UserEntity, transformOption = {}): UserSerializer {
    return plainToClass(
      UserSerializer,
      classToPlain(model, transformOption),
      transformOption
    );
  }
}
