import {
  HttpStatus,
  Inject,
  Injectable,
  UnprocessableEntityException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as config from 'config';
import { existsSync, unlinkSync } from 'fs';
import { SignOptions } from 'jsonwebtoken';
import { DeepPartial, Not, ObjectLiteral } from 'typeorm';
import {
  RateLimiterRes,
  RateLimiterStoreAbstract
} from 'rate-limiter-flexible';

import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';
import { StatusCodesList } from 'src/common/constants/status-codes-list.constants';
import { ForbiddenException } from 'src/exception/forbidden.exception';
import { NotFoundException } from 'src/exception/not-found.exception';
import { UnauthorizedException } from 'src/exception/unauthorized.exception';
import { CustomHttpException } from 'src/exception/custom-http.exception';
import { MailJobInterface } from 'src/mail/interface/mail-job.interface';
import { MailService } from 'src/mail/mail.service';
import { Pagination } from 'src/paginate';
import { RefreshToken } from 'src/refresh-token/entities/refresh-token.entity';
import { RefreshTokenService } from 'src/refresh-token/refresh-token.service';
import { ChangePasswordDto } from 'src/auth/dto/change-password.dto';
import { ForgetPasswordDto } from 'src/auth/dto/forget-password.dto';
import { ResetPasswordDto } from 'src/auth/dto/reset-password.dto';
import { UserLoginDto } from 'src/auth/dto/user-login.dto';
import { UserSearchFilterDto } from 'src/auth/dto/user-search-filter.dto';
import { UserEntity } from 'src/auth/entity/user.entity';
import {
  adminUserGroupsForSerializing,
  defaultUserGroupsForSerializing,
  ownerUserGroupsForSerializing,
  UserSerializer
} from 'src/auth/serializer/user.serializer';
import { UserStatusEnum } from 'src/auth/user-status.enum';
import { UserRepository } from 'src/auth/user.repository';
import { ValidationPayloadInterface } from 'src/common/interfaces/validation-error.interface';
import { RefreshPaginateFilterDto } from 'src/refresh-token/dto/refresh-paginate-filter.dto';
import { RefreshTokenSerializer } from 'src/refresh-token/serializer/refresh-token.serializer';

const throttleConfig = config.get('throttle.login');
const jwtConfig = config.get('jwt');
const appConfig = config.get('app');
// const isSameSite = process.env.IS_SAME_SITE || appConfig.sameSite;
// for heroku
const isSameSite =
  appConfig.sameSite !== null
    ? appConfig.sameSite
    : process.env.IS_SAME_SITE === 'true';
const BASE_OPTIONS: SignOptions = {
  issuer: appConfig.appUrl,
  audience: appConfig.frontendUrl
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly jwt: JwtService,
    private readonly mailService: MailService,
    private readonly refreshTokenService: RefreshTokenService,
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
    return this.userRepository.findBy(field, value);
  }

  /**
   * Login user by username and password
   * @param userLoginDto
   * @param refreshTokenPayload
   */
  async login(
    userLoginDto: UserLoginDto,
    refreshTokenPayload: Partial<RefreshToken>
  ): Promise<string[]> {
    const usernameIPkey = `${userLoginDto.username}_${refreshTokenPayload.ip}`;
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
      throw new CustomHttpException(
        `tooManyRequest-{"second":"${String(retrySecs)}"}`,
        HttpStatus.TOO_MANY_REQUESTS,
        StatusCodesList.TooManyTries
      );
    }

    const [user, error, code] = await this.userRepository.login(userLoginDto);
    if (!user) {
      const [result, throttleError] = await this.limitConsumerPromiseHandler(
        usernameIPkey
      );
      if (!result) {
        throw new CustomHttpException(
          `tooManyRequest-{"second":${String(
            Math.round(throttleError.msBeforeNext / 1000) || 1
          )}}`,
          HttpStatus.TOO_MANY_REQUESTS,
          StatusCodesList.TooManyTries
        );
      }
      throw new UnauthorizedException(error, code);
    }
    const accessToken = await this.generateAccessToken(user);
    let refreshToken = null;
    if (userLoginDto.remember) {
      refreshToken = await this.refreshTokenService.generateRefreshToken(
        user,
        refreshTokenPayload
      );
    }
    await this.rateLimiter.delete(usernameIPkey);
    return this.buildResponsePayload(accessToken, refreshToken);
  }

  /**
   * Generate access token
   * @param user
   * @param isTwoFAAuthenticated
   */
  public async generateAccessToken(
    user: UserSerializer,
    isTwoFAAuthenticated = false
  ): Promise<string> {
    const opts: SignOptions = {
      ...BASE_OPTIONS,
      subject: String(user.id)
    };
    return this.jwt.signAsync({
      ...opts,
      isTwoFAAuthenticated
    });
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
      ['username', 'email', 'name', 'contact', 'address'],
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
    const errorPayload: ValidationPayloadInterface[] = [];
    for (const field of checkUniqueFieldArray) {
      const condition: ObjectLiteral = {
        [field]: updateUserDto[field]
      };
      condition.id = Not(id);
      const checkUnique = await this.userRepository.countEntityByCondition(
        condition
      );
      if (checkUnique > 0) {
        errorPayload.push({
          property: field,
          constraints: {
            unique: 'already taken'
          }
        });
      }
    }
    if (Object.keys(errorPayload).length > 0) {
      throw new UnprocessableEntityException(errorPayload);
    }
    if (updateUserDto.avatar && user.avatar) {
      const path = `public/images/profile/${user.avatar}`;
      if (existsSync(path)) {
        unlinkSync(`public/images/profile/${user.avatar}`);
      }
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
      throw new ForbiddenException(
        ExceptionTitleList.UserInactive,
        StatusCodesList.UserInactive
      );
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
    const user = await this.userRepository.findOne({
      where: {
        email
      }
    });
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
      throw new CustomHttpException(
        ExceptionTitleList.IncorrectOldPassword,
        HttpStatus.PRECONDITION_FAILED,
        StatusCodesList.IncorrectOldPassword
      );
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

  /**
   * Get cookie for logout action
   */
  getCookieForLogOut(): string[] {
    return [
      `Authentication=; HttpOnly; Path=/; Max-Age=0; ${
        !isSameSite ? 'SameSite=None; Secure;' : ''
      }`,
      `Refresh=; HttpOnly; Path=/; Max-Age=0; ${
        !isSameSite ? 'SameSite=None; Secure;' : ''
      }`,
      `ExpiresIn=; Path=/; Max-Age=0; ${
        !isSameSite ? 'SameSite=None; Secure;' : ''
      }`
    ];
  }

  /**
   * build response payload
   * @param accessToken
   * @param refreshToken
   */
  buildResponsePayload(accessToken: string, refreshToken?: string): string[] {
    let tokenCookies = [
      `Authentication=${accessToken}; HttpOnly; Path=/; ${
        !isSameSite ? 'SameSite=None; Secure;' : ''
      } Max-Age=${jwtConfig.cookieExpiresIn}`
    ];
    if (refreshToken) {
      const expiration = new Date();
      expiration.setSeconds(expiration.getSeconds() + jwtConfig.expiresIn);
      tokenCookies = tokenCookies.concat([
        `Refresh=${refreshToken}; HttpOnly; Path=/; ${
          !isSameSite ? 'SameSite=None; Secure;' : ''
        } Max-Age=${jwtConfig.cookieExpiresIn}`,
        `ExpiresIn=${expiration}; Path=/; ${
          !isSameSite ? 'SameSite=None; Secure;' : ''
        } Max-Age=${jwtConfig.cookieExpiresIn}`
      ]);
    }
    return tokenCookies;
  }

  /**
   * Create access token from refresh token
   * @param refreshToken
   */
  async createAccessTokenFromRefreshToken(refreshToken: string) {
    const { token } =
      await this.refreshTokenService.createAccessTokenFromRefreshToken(
        refreshToken
      );
    return this.buildResponsePayload(token);
  }

  /**
   * revoke refresh token for logout action
   * @param encoded
   */
  async revokeRefreshToken(encoded: string): Promise<void> {
    // ignore exception because anyway we are going invalidate cookies
    try {
      const { token } = await this.refreshTokenService.resolveRefreshToken(
        encoded
      );
      if (token) {
        token.isRevoked = true;
        await token.save();
      }
    } catch (e) {
      throw new CustomHttpException(
        ExceptionTitleList.InvalidRefreshToken,
        HttpStatus.PRECONDITION_FAILED,
        StatusCodesList.InvalidRefreshToken
      );
    }
  }

  /**
   * get active refresh token list for user
   * @param userId
   * @param filter
   **/
  activeRefreshTokenList(
    userId: number,
    filter: RefreshPaginateFilterDto
  ): Promise<Pagination<RefreshTokenSerializer>> {
    return this.refreshTokenService.getRefreshTokenByUserId(userId, filter);
  }

  /**
   * revoke token by id
   * @param id
   * @param userId
   **/
  revokeTokenById(id: number, userId: number): Promise<RefreshToken> {
    return this.refreshTokenService.revokeRefreshTokenById(id, userId);
  }

  /**
   * set two factor auth secret for user
   * @param secret
   * @param userId
   **/
  async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
    // add one minute throttle to generate next two factor token
    const twoFAThrottleTime = new Date();
    twoFAThrottleTime.setSeconds(twoFAThrottleTime.getSeconds() + 60);
    return this.userRepository.update(userId, {
      twoFASecret: secret,
      twoFAThrottleTime
    });
  }

  /**
   * Turn two factor authentication for user
   * @param user
   * @param isTwoFAEnabled
   * @param qrDataUri
   **/
  async turnOnTwoFactorAuthentication(
    user: UserEntity,
    isTwoFAEnabled = true,
    qrDataUri: string
  ) {
    if (isTwoFAEnabled) {
      const subject = 'Activate Two Factor Authentication';
      const mailData: MailJobInterface = {
        to: user.email,
        subject,
        slug: 'two-factor-authentication',
        context: {
          email: user.email,
          qrcode: 'cid:2fa-qrcode',
          username: user.username,
          subject
        },
        attachments: [
          {
            filename: '2fa-qrcode.png',
            path: qrDataUri,
            cid: '2fa-qrcode'
          }
        ]
      };
      await this.mailService.sendMail(mailData, 'system-mail');
    }
    return this.userRepository.update(user.id, {
      isTwoFAEnabled
    });
  }

  /**
   * Count data by condition
   * @param condition
   **/
  async countByCondition(condition: ObjectLiteral) {
    return this.userRepository.countEntityByCondition(condition);
  }

  async getRefreshTokenGroupedData(field: string) {
    return this.refreshTokenService.getRefreshTokenGroupedData(field);
  }
}
