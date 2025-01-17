import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { envKey } from 'src/common/const/env.const';
import { PrismaService } from 'src/common/prisma.service';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dto/register.dto';
import { Logger } from 'winston';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly saltOrRounds: number;
  private readonly jwtSecret: string;
  private readonly accessTokenType: string;
  private readonly refreshTokenType: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    @Inject('winston') private readonly logger: Logger,
  ) {
    this.jwtSecret = this.configService.get(envKey.jwtSecret);
    this.accessTokenType = this.configService.get(envKey.accessToken);
    this.refreshTokenType = this.configService.get(envKey.refreshToken);
    this.saltOrRounds = this.configService.get(envKey.saltOrRounds);
  }

  async register(registerDto: RegisterDto) {
    const username = registerDto.username;
    const password = registerDto.password;
    const passwordConfirm = registerDto.passwordConfirm;

    if (password !== passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new BadRequestException('user already existing');
    }
    const hashedPassword = await bcrypt.hash(password, this.saltOrRounds);

    const user = await this.prisma.user.create({
      data: { username, password: hashedPassword },
    });

    const accessToken = await this.generateToken(
      user.id,
      username,
      this.accessTokenType,
    );
    const refreshToken = await this.generateToken(
      user.id,
      username,
      this.refreshTokenType,
    );

    return { accessToken, refreshToken };
  }

  async validateUser(username: string, password: string) {
    const user = await this.userService.findOne(username);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async generateToken(userId: number, username: string, type: string) {
    const expiresIn = type === this.accessTokenType ? '5m' : '7d';

    return await this.jwtService.signAsync(
      { userId, username, type },
      { secret: this.jwtSecret, expiresIn },
    );
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.jwtSecret,
      });

      if (payload.type !== this.refreshTokenType) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = await this.generateToken(
        payload.userId,
        payload.username,
        this.accessTokenType,
      );
      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async login(user: User) {
    const accessToken = await this.generateToken(
      user.id,
      user.username,
      this.accessTokenType,
    );
    const refreshToken = await this.generateToken(
      user.id,
      user.username,
      this.refreshTokenType,
    );

    return { accessToken, refreshToken };
  }
}
