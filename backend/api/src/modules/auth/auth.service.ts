import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as crypto from 'crypto';

let bcryptLib: any = null;
try {
  bcryptLib = require('bcryptjs');
} catch {
  try {
    bcryptLib = require('bcrypt');
  } catch {
    bcryptLib = null;
  }
}

let jwtLib: any = null;
try {
  jwtLib = require('jsonwebtoken');
} catch {
  jwtLib = null;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret =
      this.configService.get<string>('JWT_SECRET') ||
      'taamim-moroccan-cantillation-secret-jwt-key-2026';
  }

  private async hashPassword(password: string): Promise<string> {
    if (bcryptLib?.hash) {
      return bcryptLib.hash(password, 10);
    }
    // Node.js crypto fallback (10k rounds equivalent)
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `$pbkdf2$10$${salt}$${hash}`;
  }

  private async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    if (
      bcryptLib?.compare &&
      (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$'))
    ) {
      return bcryptLib.compare(password, storedHash);
    }
    if (storedHash.startsWith('$pbkdf2$')) {
      const parts = storedHash.split('$');
      const salt = parts[3];
      const key = parts[4];
      const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
      return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(key));
    }
    if (bcryptLib?.compare) {
      return bcryptLib.compare(password, storedHash);
    }
    return false;
  }

  private generateToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    if (jwtLib?.sign) {
      return jwtLib.sign(payload, this.jwtSecret, { expiresIn: '7d' });
    }
    // High-performance HMAC-SHA256 JWT generation
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
    const signature = crypto
      .createHmac('sha256', this.jwtSecret)
      .update(`${header}.${body}`)
      .digest('base64url');
    return `${header}.${body}.${signature}`;
  }

  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();

    // Check if email already registered
    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ConflictException('כתובת האימייל כבר קיימת במערכת');
    }

    const username =
      dto.username?.trim().toLowerCase() ||
      `${normalizedEmail.split('@')[0]}_${Math.floor(1000 + Math.random() * 9000)}`;

    const passwordHash = await this.hashPassword(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          username,
          displayName: dto.displayName.trim(),
          passwordHash,
          totalXp: 0,
          hearts: 5,
          streakCount: 1,
        },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          totalXp: true,
          hearts: true,
          streakCount: true,
          createdAt: true,
        },
      });

      const accessToken = this.generateToken(user.id, user.email);

      return {
        accessToken,
        user: {
          ...user,
          streak: user.streakCount,
        },
      };
    } catch (error) {
      this.logger.error(`Registration failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('שגיאה ביצירת המשתמש, נא לנסות שנית');
    }
  }

  async login(dto: LoginDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException('אימייל או סיסמה שגויים');
    }

    const isMatch = await this.verifyPassword(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('אימייל או סיסמה שגויים');
    }

    const accessToken = this.generateToken(user.id, user.email);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        totalXp: user.totalXp,
        hearts: user.hearts,
        streak: user.streakCount,
        createdAt: user.createdAt,
      },
    };
  }
}
