import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
  ValidationPipe
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/user-login.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserEntity } from './entity/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { UserSerializer } from './serializer/user.serializer';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PermissionGuard } from '../common/guard/permission.guard';
import { Pagination } from '../paginate';
import { Response, Request } from 'express';
import { UserSearchFilterDto } from './dto/user-search-filter.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { RequestIpDto } from './dto/request-ip.dto';

@ApiTags('user')
@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/auth/register')
  register(
    @Body(ValidationPipe) registerUserDto: RegisterUserDto
  ): Promise<UserSerializer> {
    return this.authService.create(registerUserDto);
  }

  @Post('/auth/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: RequestIpDto,
    @Res() response: Response,
    @Body() userLoginDto: UserLoginDto
  ) {
    const cookiePayload = await this.authService.login(userLoginDto, req.ip);
    response.setHeader('Set-Cookie', cookiePayload);
    response.json({});
  }

  @UseGuards(AuthGuard(), PermissionGuard)
  @Get('/auth/profile')
  @ApiBearerAuth()
  profile(@GetUser() user: UserEntity): Promise<UserSerializer> {
    return this.authService.get(user);
  }

  @UseGuards(AuthGuard(), PermissionGuard)
  @Put('/auth/profile')
  @ApiBearerAuth()
  updateProfile(
    @GetUser() user: UserEntity,
    @Body() updateUserDto: UpdateUserProfileDto
  ): Promise<UserSerializer> {
    return this.authService.update(user.id, updateUserDto);
  }

  @Get('/auth/activate-account')
  @HttpCode(HttpStatus.NO_CONTENT)
  activateAccount(@Query('token') token: string): Promise<void> {
    return this.authService.activateAccount(token);
  }

  @Put('/auth/forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  forgotPassword(@Body() forgetPasswordDto: ForgetPasswordDto): Promise<void> {
    return this.authService.forgotPassword(forgetPasswordDto);
  }

  @Put('/auth/reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(AuthGuard(), PermissionGuard)
  @ApiBearerAuth()
  @Put('/auth/change-password')
  changePassword(
    @GetUser() user: UserEntity,
    @Body() changePasswordDto: ChangePasswordDto
  ): Promise<void> {
    return this.authService.changePassword(user, changePasswordDto);
  }

  @UseGuards(AuthGuard(), PermissionGuard)
  @ApiBearerAuth()
  @Get('/users')
  findAll(
    @Query() userSearchFilterDto: UserSearchFilterDto
  ): Promise<Pagination<UserSerializer>> {
    return this.authService.findAll(userSearchFilterDto);
  }

  @UseGuards(AuthGuard(), PermissionGuard)
  @ApiBearerAuth()
  @Post('/users')
  create(
    @Body(ValidationPipe) createUserDto: CreateUserDto
  ): Promise<UserSerializer> {
    return this.authService.create(createUserDto);
  }

  @UseGuards(AuthGuard(), PermissionGuard)
  @ApiBearerAuth()
  @Put('/users/:id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserSerializer> {
    return this.authService.update(+id, updateUserDto);
  }

  @UseGuards(AuthGuard(), PermissionGuard)
  @ApiBearerAuth()
  @Get('/users/:id')
  findOne(@Param('id') id: string): Promise<UserSerializer> {
    return this.authService.findById(+id);
  }

  @Post('/refresh')
  async refresh(@Req() req: Request, @Res() response: Response) {
    const cookiePayload =
      await this.authService.createAccessTokenFromRefreshToken(
        req.cookies['Refresh']
      );
    response.setHeader('Set-Cookie', cookiePayload);
    response.json({});
  }

  @UseGuards(AuthGuard(), PermissionGuard)
  @ApiBearerAuth()
  @Post('/logout')
  async logOut(@Req() req: Request, @Res() response: Response) {
    await this.authService.revokeRefreshToken(req.cookies['Refresh']);
    response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
    return response.sendStatus(204);
  }
}
