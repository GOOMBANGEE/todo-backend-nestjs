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
  private readonly accessTokenType: string;
  private readonly accessTokenExpires: string;
  private readonly accessTokenSecret: string;
  private readonly refreshTokenType: string;
  private readonly refreshTokenExpires: string;
  private readonly refreshTokenSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    @Inject('winston') private readonly logger: Logger,
  ) {
    this.accessTokenType = this.configService.get(envKey.accessToken);
    this.accessTokenExpires = this.configService.get(envKey.accessTokenExpires);
    this.accessTokenSecret = this.configService.get(envKey.accessTokenSecret);
    this.refreshTokenType = this.configService.get(envKey.refreshToken);
    this.refreshTokenExpires = this.configService.get(
      envKey.refreshTokenExpires,
    );
    this.refreshTokenSecret = this.configService.get(envKey.refreshTokenSecret);
    this.saltOrRounds = Number(this.configService.get(envKey.saltOrRounds));
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
    return this.generateToken(user.id, user.username);
  }

  async validateUser(username: string, password: string) {
    const user = await this.userService.findOne(username);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async generateToken(userId: number, username: string) {
    const accessToken = await this.jwtService.signAsync(
      { userId, username, type: this.accessTokenType },
      { secret: this.accessTokenSecret, expiresIn: this.accessTokenExpires },
    );
    const refreshToken = await this.jwtService.signAsync(
      { userId, username, type: this.refreshTokenType },
      { secret: this.refreshTokenSecret, expiresIn: this.refreshTokenExpires },
    );

    return { accessToken, refreshToken };
  }

  async refreshToken(requestUser) {
    if (requestUser.type !== this.refreshTokenType) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = await this.jwtService.signAsync(
      {
        userId: requestUser.userId,
        username: requestUser.username,
        type: this.accessTokenType,
      },
      { secret: this.accessTokenSecret, expiresIn: this.accessTokenExpires },
    );

    return { accessToken };
  }

  async login(user: User) {
    return this.generateToken(user.id, user.username);
  }
}
