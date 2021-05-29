import { DeepPartial, EntityRepository } from 'typeorm';
import { UserEntity } from './entity/user.entity';
import * as bcrypt from 'bcrypt';
import { UserLoginDto } from './dto/user-login.dto';
import {
  HttpException,
  HttpStatus,
  UnauthorizedException
} from '@nestjs/common';
import { BaseRepository } from '../common/repository/base.repository';
import { UserSerializer } from './serializer/user.serializer';
import { classToPlain, plainToClass } from 'class-transformer';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserStatusEnum } from './user-status.enum';

@EntityRepository(UserEntity)
export class UserRepository extends BaseRepository<UserEntity, UserSerializer> {
  /**
   * store new user
   * @param createUserDto
   * @param token
   */
  async store(
    createUserDto: DeepPartial<UserEntity>,
    token: string
  ): Promise<UserSerializer> {
    if (!createUserDto.status) {
      createUserDto.status = UserStatusEnum.INACTIVE;
    }
    createUserDto.salt = await bcrypt.genSalt();
    createUserDto.token = token;
    const user = this.create(createUserDto);
    await user.save();
    return this.transform(user);
  }

  /**
   * login user
   * @param userLoginDto
   */
  async login(userLoginDto: UserLoginDto): Promise<UserEntity> {
    const { username, password } = userLoginDto;
    const user = await this.findOne({
      where: [{ username: username }, { email: username }]
    });
    if (user && (await user.validatePassword(password))) {
      if (user.status !== UserStatusEnum.ACTIVE) {
        throw new HttpException('InactiveUser', HttpStatus.FORBIDDEN);
      }
      return user;
    }
    throw new UnauthorizedException();
  }

  /**
   * Get user entity for reset password
   * @param resetPasswordDto
   */
  async getUserForResetPassword(
    resetPasswordDto: ResetPasswordDto
  ): Promise<UserEntity> {
    const { token } = resetPasswordDto;
    const query = this.createQueryBuilder('user');
    query.where('user.token = :token', { token });
    query.andWhere('user.tokenValidityDate > :date', { date: new Date() });
    return query.getOne();
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

  /**
   * transform users collection
   * @param models
   * @param transformOption
   */
  transformMany(models: UserEntity[], transformOption = {}): UserSerializer[] {
    return models.map((model) => this.transform(model, transformOption));
  }
}
