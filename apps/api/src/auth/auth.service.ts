import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ServiceUnavailableException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { PasswordService } from './password.service';

type TokenUser = {
  id: string;
  email: string;
  status: string;
  roles: string[];
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly passwords: PasswordService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly email: EmailService
  ) {}

  async register(input: { email: string; password: string; role: 'FOUNDER' | 'INVESTOR' }) {
    this.assertDatabaseConfigured();
    const email = input.email.toLowerCase();
    const existing = await this.users.findByEmail(email);

    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    const role = await this.prisma.role.findUniqueOrThrow({
      where: { name: input.role }
    });

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: await this.passwords.hash(input.password),
        status: 'ACTIVE',
        roles: {
          create: {
            roleId: role.id
          }
        }
      },
      include: { roles: { include: { role: true } } }
    });

    const verificationToken = this.createOpaqueToken();
    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(verificationToken),
        expiresAt: this.daysFromNow(3)
      }
    });
    await this.email.sendMail({
      to: user.email,
      subject: 'Verify your Investor Marketplace account',
      text: `Verify your account: ${this.config.get<string>('APP_FRONTEND_URL')}/verify-email?token=${verificationToken}`
    });

    const response = await this.issueAuthResponse({
      id: user.id,
      email: user.email,
      status: user.status,
      roles: user.roles.map((entry) => entry.role.name)
    });
    if (this.config.get<string>('NODE_ENV', 'development') !== 'production') {
      return { ...response, developmentVerificationToken: verificationToken };
    }
    return response;
  }

  async login(input: { email: string; password: string }) {
    this.assertDatabaseConfigured();
    const user = await this.users.findByEmail(input.email);

    if (!user || !(await this.passwords.verify(input.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Your account is not active.');
    }

    return this.issueAuthResponse({
      id: user.id,
      email: user.email,
      status: user.status,
      roles: user.roles.map((entry) => entry.role.name)
    });
  }

  async refresh(refreshToken: string) {
    this.assertDatabaseConfigured();
    const tokenHash = this.hashToken(refreshToken);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: { roles: { include: { role: true } } }
        }
      }
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() }
    });

    return this.issueAuthResponse({
      id: storedToken.user.id,
      email: storedToken.user.email,
      status: storedToken.user.status,
      roles: storedToken.user.roles.map((entry) => entry.role.name)
    });
  }

  async logout(refreshToken: string) {
    this.assertDatabaseConfigured();
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.hashToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() }
    });

    return { success: true };
  }

  async getMe(userId: string) {
    this.assertDatabaseConfigured();
    return this.users.getCurrentUser(userId);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    this.assertDatabaseConfigured();
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const valid = await this.passwords.verify(currentPassword, user.passwordHash);

    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await this.passwords.hash(newPassword) }
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });

    return { success: true };
  }

  async requestPasswordReset(email: string) {
    this.assertDatabaseConfigured();
    const user = await this.users.findByEmail(email);
    if (!user) {
      return { success: true };
    }

    const token = this.createOpaqueToken();
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(token),
        expiresAt: this.daysFromNow(1)
      }
    });

    await this.email.sendMail({
      to: user.email,
      subject: 'Reset your Investor Marketplace password',
      text: `Reset your password: ${this.config.get<string>('APP_FRONTEND_URL')}/reset-password?token=${token}`
    });

    return this.config.get<string>('NODE_ENV', 'development') === 'production'
      ? { success: true }
      : { success: true, developmentToken: token };
  }

  async resetPassword(token: string, newPassword: string) {
    this.assertDatabaseConfigured();
    const tokenHash = this.hashToken(token);
    const storedToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash }
    });

    if (!storedToken || storedToken.usedAt || storedToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    await this.prisma.user.update({
      where: { id: storedToken.userId },
      data: { passwordHash: await this.passwords.hash(newPassword) }
    });
    await this.prisma.passwordResetToken.update({
      where: { id: storedToken.id },
      data: { usedAt: new Date() }
    });
    await this.prisma.refreshToken.updateMany({
      where: { userId: storedToken.userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });

    return { success: true };
  }

  async verifyEmail(token: string) {
    this.assertDatabaseConfigured();
    const tokenHash = this.hashToken(token);
    const storedToken = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash }
    });

    if (!storedToken || storedToken.usedAt || storedToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification token.');
    }

    await this.prisma.user.update({
      where: { id: storedToken.userId },
      data: { emailVerifiedAt: new Date() }
    });
    await this.prisma.emailVerificationToken.update({
      where: { id: storedToken.id },
      data: { usedAt: new Date() }
    });

    return { success: true };
  }

  private async issueAuthResponse(user: TokenUser) {
    this.assertDatabaseConfigured();
    const accessToken = await this.jwt.signAsync(
      {
        sub: user.id,
        email: user.email,
        roles: user.roles
      },
      {
        secret: this.config.get<string>('JWT_ACCESS_SECRET', 'change_me_access_secret'),
        expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m') as never
      }
    );
    const refreshToken = this.createOpaqueToken();

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: this.daysFromNow(30)
      }
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
        status: user.status,
        profileStatus: {
          founderProfileComplete: false,
          investorProfileComplete: false,
          organizationComplete: false
        },
        organizationMemberships: []
      }
    };
  }

  private createOpaqueToken() {
    return randomBytes(48).toString('base64url');
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private daysFromNow(days: number) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  private assertDatabaseConfigured() {
    if (!this.config.get<string>('DATABASE_URL')) {
      throw new ServiceUnavailableException('DATABASE_URL is not configured in Vercel.');
    }
  }
}
