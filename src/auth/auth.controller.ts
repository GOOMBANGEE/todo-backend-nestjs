import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalGuard } from './guard/local.guard';
import { Authorization } from './decorator/authorization.decorator';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // /auth/register
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // /auth/login
  // @UseGuards(AuthGuard('local')) // auth/strategy/local.strategy.ts return user; => req.user = user
  @UseGuards(LocalGuard) // auth/guard/local.guard.ts => LocalGuard extends AuthGuard('local')
  @Post('login')
  create(@Authorization() user: User) {
    return this.authService.login(user);
  }
}
