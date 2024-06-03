import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { AuthDto, ResetPasswordDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash, verify } from 'argon2';
import { Tokens } from './types';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { Role } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(dto: AuthDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user || !user.hashPassword)
      throw new ForbiddenException('Credentials incorrect');
    const pwMatches = await verify(user.hashPassword, dto.password);
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    const tokens = await this.getTokens(user.id, user.email, user.role);

    return tokens;
  }

  async logout(userId: string) {
    const res = await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: undefined },
    });
    return true;
  }

  async resetPassword(userId: string, dto: ResetPasswordDto) {
    try {
      const user = await this.userService.get(userId);
      const hashPassword = await hash(dto.newPassword);
      const changed = await this.userService.update(user.id, {
        hashPassword,
      });
      delete changed.createdAt;
      delete changed.refreshToken;

      return changed;
    } catch (e) {
      throw new ForbiddenException();
    }
  }

  async refteshTokens(userId: string, refreshToken: string): Promise<Tokens> {
    const user = await this.userService.get(userId);
    const rtMatches = refreshToken === user.refreshToken;
    if (!rtMatches) throw new ForbiddenException();

    const tokens = await this.getTokens(user.id, user.email, user.role);

    return tokens;
  }

  async getTokens(userId: string, email: string, role: Role): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.createToken({ sub: userId, email, role }, 'JWT_SECRET', 60 * 15),
      this.createToken(
        { sub: userId, email, role },
        'JWT_REFRESH_SECRET',
        60 * 60 * 24 * 7,
      ),
    ]);
    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async createToken(payload: object, secret: string, expiration: number) {
    return await this.jwtService.signAsync(payload, {
      secret: this.config.get(secret),
      expiresIn: expiration,
    });
  }

  async onModuleInit() {
    const superUser = await this.prisma.user.findUnique({
      where: { email: this.config.get('SUPERUSER_EMAIL') },
    });
    if (!superUser) {
      Logger.log('Super User not created, creating...');
      const hashPassword = await hash(this.config.get('SUPERUSER_PASSWORD'));

      this.userService.create(
        {
          firstName: this.config.get('SUPERUSER_FIRSTNAME'),
          lastName: this.config.get('SUPERUSER_LASTNAME'),
          email: this.config.get('SUPERUSER_EMAIL'),
          role: 'OWNER',
        },
        hashPassword,
      );
    }
  }
}
