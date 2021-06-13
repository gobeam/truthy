import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { UserLoginDto } from './dto/user-login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import {
  adminUserGroupsForSerializing,
  defaultUserGroupsForSerializing,
  ownerUserGroupsForSerializing,
  UserSerializer
} from './serializer/user.serializer';
import { DeepPartial, Not, ObjectLiteral } from 'typeorm';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as config from 'config';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { UserStatusEnum } from './user-status.enum';
import { ChangePasswordDto } from './dto/change-password.dto';
import { MailService } from '../mail/mail.service';
import { MailJobInterface } from '../mail/interface/mail-job.interface';
import { Pagination } from '../paginate';
import { UserSearchFilterDto } from './dto/user-search-filter.dto';
import {
  RateLimiterRes,
  RateLimiterStoreAbstract
} from 'rate-limiter-flexible';
const throttleConfig = config.get('throttle.login');

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @Inject('LOGIN_THROTTLE')
    private readonly rateLimiter: RateLimiterStoreAbstract
  ) {}

  /**
   * send mail
   * @param user
   * @param subject
   * @param url
   * @param slug
   * @param linkLabel
   */
  async sendMailToUser(
    user: UserSerializer,
    subject: string,
    url: string,
    slug: string,
    linkLabel: string
  ) {
    const appConfig = config.get('app');
    const mailData: MailJobInterface = {
      to: user.email,
      subject,
      slug,
      context: {
        email: user.email,
        link: `<a href="${appConfig.frontendUrl}/${url}">${linkLabel} →</a>`,
        username: user.username,
        subject
      }
    };
    await this.mailService.sendMail(mailData, 'system-mail');
  }

  /**
   * add new user
   * @param createUserDto
   */
  async create(
    createUserDto: DeepPartial<UserEntity>
  ): Promise<UserSerializer> {
    const token = await this.generateUniqueToken(12);
    if (!createUserDto.status) {
      createUserDto.roleId = 2;
      const currentDateTime = new Date();
      currentDateTime.setHours(currentDateTime.getHours() + 1);
      createUserDto.tokenValidityDate = currentDateTime;
    }
    const registerProcess = !createUserDto.status;
    const user = await this.userRepository.store(createUserDto, token);
    const subject = registerProcess ? 'Account created' : 'Set Password';
    const link = registerProcess ? `verify/${token}` : `reset/${token}`;
    const slug = registerProcess ? 'activate-account' : 'new-user-set-password';
    const linkLabel = registerProcess ? 'Activate Account' : 'Set Password';
    await this.sendMailToUser(user, subject, link, slug, linkLabel);
    return user;
  }

  /**
   * find user entity by condition
   * @param field
   * @param value
   */
  async findBy(field: string, value: string): Promise<UserSerializer> {
    return await this.userRepository.findBy(field, value);
  }

  /**
   *
   * @param userLoginDto
   * @param ip
   */
  async login(
    userLoginDto: UserLoginDto,
    ip: string
  ): Promise<{ accessToken: string }> {
    const usernameIPkey = `${userLoginDto.username}_${ip}`;
    const resUsernameAndIP = await this.rateLimiter.get(usernameIPkey);
    let retrySecs = 0;
    // Check if user is already blocked
    if (
      resUsernameAndIP !== null &&
      resUsernameAndIP.consumedPoints > throttleConfig.limit
    ) {
      retrySecs = Math.round(resUsernameAndIP.msBeforeNext / 1000) || 1;
    }
    if (retrySecs > 0) {
      throw new HttpException(
        `Too many tries, retry after ${String(retrySecs)} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    const [user, error] = await this.userRepository.login(userLoginDto);
    if (!user) {
      const [result, throttleError] = await this.limitConsumerPromiseHandler(
        usernameIPkey
      );
      if (!result) {
        throw new HttpException(
          `Too many tries, retry after ${String(
            Math.round(throttleError.msBeforeNext / 1000) || 1
          )} seconds.`,
          HttpStatus.TOO_MANY_REQUESTS
        );
      }

      throw new UnauthorizedException(error);
    }
    const payload: JwtPayloadDto = {
      username: user.username,
      name: user.name
    };
    const accessToken = await this.jwtService.sign(payload);
    await this.rateLimiter.delete(usernameIPkey);
    return { accessToken };
  }

  /**
   * promise handler to handle result and error for login
   * throttle by user
   * @param usernameIPkey
   */
  async limitConsumerPromiseHandler(
    usernameIPkey: string
  ): Promise<[RateLimiterRes, RateLimiterRes]> {
    return new Promise((resolve) => {
      this.rateLimiter
        .consume(usernameIPkey)
        .then((rateLimiterRes) => {
          resolve([rateLimiterRes, null]);
        })
        .catch((rateLimiterError) => {
          resolve([null, rateLimiterError]);
        });
    });
  }

  /**
   * get user profile
   * @param user
   */
  async get(user: UserEntity): Promise<UserSerializer> {
    return this.userRepository.transform(user, {
      groups: ownerUserGroupsForSerializing
    });
  }

  /**
   * Get user By Id
   * @param id
   */
  async findById(id: number): Promise<UserSerializer> {
    return this.userRepository.get(id, ['role'], {
      groups: [
        ...adminUserGroupsForSerializing,
        ...ownerUserGroupsForSerializing
      ]
    });
  }

  /**
   * Get all user paginated
   * @param userSearchFilterDto
   */
  async findAll(
    userSearchFilterDto: UserSearchFilterDto
  ): Promise<Pagination<UserSerializer>> {
    return this.userRepository.paginate(
      userSearchFilterDto,
      ['role'],
      ['username', 'email', 'name'],
      {
        groups: [
          ...adminUserGroupsForSerializing,
          ...ownerUserGroupsForSerializing,
          ...defaultUserGroupsForSerializing
        ]
      }
    );
  }

  /**
   * update user
   * @param id
   * @param updateUserDto
   */
  async update(
    id: number,
    updateUserDto: DeepPartial<UserEntity>
  ): Promise<UserSerializer> {
    const user = await this.userRepository.get(id, [], {
      groups: [
        ...ownerUserGroupsForSerializing,
        ...adminUserGroupsForSerializing
      ]
    });
    const checkUniqueFieldArray = ['username', 'email'];
    const error = {};
    for (const field of checkUniqueFieldArray) {
      const condition: ObjectLiteral = {
        [field]: updateUserDto[field]
      };
      condition.id = Not(id);
      const checkUnique = await this.userRepository.countEntityByCondition(
        condition
      );
      if (checkUnique > 0) {
        error[field] = `already taken`;
      }
    }
    if (Object.keys(error).length > 0) {
      throw new UnprocessableEntityException(error);
    }
    return this.userRepository.updateEntity(user, updateUserDto);
  }

  /**
   * activate newly register account
   * @param token
   */
  async activateAccount(token: string): Promise<void> {
    const user = await this.userRepository.findOne({ token });
    if (!user) {
      throw new NotFoundException();
    }
    if (user.status !== UserStatusEnum.INACTIVE) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    user.status = UserStatusEnum.ACTIVE;
    user.token = await this.generateUniqueToken(6);
    user.skipHashPassword = true;
    await user.save();
  }

  /**
   * forget password and send reset code by email
   * @param forgetPasswordDto
   */
  async forgotPassword(forgetPasswordDto: ForgetPasswordDto): Promise<void> {
    const { email } = forgetPasswordDto;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return;
    }
    const token = await this.generateUniqueToken(6);
    user.token = token;
    const currentDateTime = new Date();
    currentDateTime.setHours(currentDateTime.getHours() + 1);
    user.tokenValidityDate = currentDateTime;
    user.skipHashPassword = true;
    await user.save();
    const subject = 'Reset Password';
    await this.sendMailToUser(
      user,
      subject,
      `reset/${token}`,
      'reset-password',
      subject
    );
  }

  /**
   * reset password using token
   * @param resetPasswordDto
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { password } = resetPasswordDto;
    const user = await this.userRepository.getUserForResetPassword(
      resetPasswordDto
    );
    if (!user) {
      throw new NotFoundException();
    }
    user.token = await this.generateUniqueToken(6);
    user.password = password;
    await user.save();
  }

  /**
   * change password of logged in user
   * @param user
   * @param changePasswordDto
   */
  async changePassword(
    user: UserEntity,
    changePasswordDto: ChangePasswordDto
  ): Promise<void> {
    const { oldPassword, password } = changePasswordDto;
    const checkOldPwdMatches = await user.validatePassword(oldPassword);
    if (!checkOldPwdMatches) {
      throw new UnauthorizedException();
    }
    user.password = password;
    await user.save();
  }

  /**
   * generate random string code providing length
   * @param length
   * @param uppercase
   * @param lowercase
   * @param numerical
   */
  generateRandomCode(
    length: number,
    uppercase = true,
    lowercase = true,
    numerical = true
  ): string {
    let result = '';
    const lowerCaseAlphabets = 'abcdefghijklmnopqrstuvwxyz';
    const upperCaseAlphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numericalLetters = '0123456789';
    let characters = '';
    if (uppercase) {
      characters += upperCaseAlphabets;
    }
    if (lowercase) {
      characters += lowerCaseAlphabets;
    }
    if (numerical) {
      characters += numericalLetters;
    }
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  /**
   * generate unique token
   * @param length
   */
  async generateUniqueToken(length: number): Promise<string> {
    const token = this.generateRandomCode(length);
    const condition: ObjectLiteral = {
      token
    };
    const tokenCount = await this.userRepository.countEntityByCondition(
      condition
    );
    if (tokenCount > 0) {
      await this.generateUniqueToken(length);
    }
    return token;
  }
}
