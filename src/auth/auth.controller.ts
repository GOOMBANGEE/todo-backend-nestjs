import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalGuard } from './guard/local.guard';
import { RefreshGuard } from './guard/refresh.guard';
import { RequestUser } from './decorator/user.decorator';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { AccessGuard } from './guard/access.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // /auth/register
  // return {accessToken, refreshToken}
  @Post('register')
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        username: 'test',
        accessToken: 'string',
        accessTokenExpires: 300000,
      },
    },
  })
  register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.register(registerDto, response);
  }

  // /auth/login
  // @UseGuards(AuthGuard('local')) // auth/strategy/local.strategy.ts return user; => req.user = user
  @Post('login')
  @UseGuards(LocalGuard) // auth/guard/local.guard.ts => LocalGuard extends AuthGuard('local')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ schema: { example: { username: 'test', password: '1q2w3e4r!' } } })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        username: 'test',
        accessToken: 'string',
        accessTokenExpires: 300000,
      },
    },
  })
  login(
    @RequestUser() request,
    @Res({ passthrough: true }) response: Response,
  ) {
    // console.log(request);
    return this.authService.login(request, response);
  }

  // /auth/refresh
  @Get('refresh')
  @UseGuards(RefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('refreshToken')
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        username: 'test',
        accessToken: 'string',
        accessTokenExpires: 300000,
      },
    },
  })
  refresh(@RequestUser() requestUser) {
    return this.authService.refreshToken(requestUser);
  }

  // /auth/logout
  @Get('logout')
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('accessToken')
  logout(@Res({ passthrough: true }) response: Response) {
    return this.authService.logout(response);
  }
}
