import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CommonModule } from 'src/common/common.module';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategy/local.strategy';
import { AccessStrategy } from './strategy/access.strategy';
import { RefreshStrategy } from './strategy/refresh.strategy';

@Module({
  imports: [CommonModule, PassportModule, JwtModule, UserModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtService,
    AccessStrategy,
    RefreshStrategy,
  ],
  exports: [LocalStrategy, AccessStrategy, RefreshStrategy, AuthService],
})
export class AuthModule {}
