import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { roles: { include: { role: true } } }
    });
  }

  async findAuthUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      status: user.status,
      roles: user.roles.map((entry) => entry.role.name)
    };
  }

  async getCurrentUser(id: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
      include: { roles: { include: { role: true } } }
    });

    return {
      id: user.id,
      email: user.email,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt,
      roles: user.roles.map((entry) => entry.role.name),
      profileStatus: {
        founderProfileComplete: false,
        investorProfileComplete: false,
        organizationComplete: false
      },
      organizationMemberships: []
    };
  }

  async updateCurrentUser(id: string, input: { email?: string }) {
    const user = await this.prisma.user.update({
      where: { id },
      data: input.email ? { email: input.email.toLowerCase() } : {}
    });

    return {
      id: user.id,
      email: user.email,
      status: user.status
    };
  }
}

