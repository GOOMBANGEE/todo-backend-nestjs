import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalGuard } from './guard/local.guard';
import { RefreshGuard } from './guard/refresh.guard';
import { RequestUser } from './decorator/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // /auth/register
  // return {accessToken, refreshToken}
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // /auth/login
  // @UseGuards(AuthGuard('local')) // auth/strategy/local.strategy.ts return user; => req.user = user
  @Post('login')
  @UseGuards(LocalGuard) // auth/guard/local.guard.ts => LocalGuard extends AuthGuard('local')
  create(@RequestUser() request) {
    console.log(request);
    return this.authService.login(request);
  }

  @Post('refresh')
  @UseGuards(RefreshGuard)
  refresh(@RequestUser() request) {
    console.log(request);
    return this.authService.refreshToken(request);
  }
}
