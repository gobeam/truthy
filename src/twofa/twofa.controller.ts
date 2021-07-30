import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';
import { TwofaService } from './twofa.service';
import { AuthService } from '../auth/auth.service';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserEntity } from '../auth/entity/user.entity';
import { TwofaCodeDto } from './dto/twofa-code.dto';
import { JwtAuthGuard } from '../common/guard/jwt-auth.guard';
import { Request, Response } from 'express';

@Controller('twofa')
export class TwofaController {
  constructor(
    private readonly twofaService: TwofaService,
    private readonly usersService: AuthService
  ) {}

  @Post('authenticate')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async authenticate(
    @Req() req: Request,
    @Res() response: Response,
    @GetUser() user: UserEntity,
    @Body() twofaCodeDto: TwofaCodeDto
  ) {
    const isCodeValid = this.twofaService.isTwoFACodeValid(
      twofaCodeDto.code,
      user
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    const accessToken = await this.usersService.generateAccessToken(user, true);
    const cookiePayload = this.usersService.buildResponsePayload(accessToken);
    response.setHeader('Set-Cookie', cookiePayload);
    return response.status(HttpStatus.NO_CONTENT).json({});
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async register(@Res() response: Response, @GetUser() user: UserEntity) {
    const { otpauthUrl } = await this.twofaService.generateTwoFASecret(user);
    return this.twofaService.pipeQrCodeStream(response, otpauthUrl);
  }
}
