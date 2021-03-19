import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
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
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  signUp(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<void> {
    return this.authService.addUser(createUserDto);
  }

  @Post('/login')
  @HttpCode(200)
  signIn(@Body() userLoginDto: UserLoginDto) {
    return this.authService.login(userLoginDto);
  }

  @UseGuards(AuthGuard())
  @Get('/profile')
  profile(@GetUser() user: UserEntity): Promise<UserSerializer> {
    return this.authService.get(user);
  }

  @UseGuards(AuthGuard())
  @Put('/profile')
  update(
    @GetUser() user: UserEntity,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserSerializer> {
    return this.authService.update(user, updateUserDto);
  }
}
