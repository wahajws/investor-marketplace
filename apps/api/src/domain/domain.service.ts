import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class DomainService {
  constructor(private readonly prisma: PrismaService) {}

  isAdmin(user: AuthenticatedUser) {
    return user.roles.includes('ADMIN');
  }

  async audit(userId: string | undefined, action: string, entityType?: string, entityId?: string, metadata?: unknown) {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        metadata: metadata === undefined ? undefined : JSON.parse(JSON.stringify(metadata))
      }
    });
  }

  async getPrimaryOrganizationId(userId: string) {
    const member = await this.prisma.organizationMember.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });
    return member?.organizationId ?? null;
  }

  async assertCompanyAccess(user: AuthenticatedUser, companyId: string, mode: 'read' | 'write' = 'read') {
    if (this.isAdmin(user)) {
      return;
    }

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { members: true }
    });
    if (!company) {
      throw new NotFoundException('Company not found.');
    }

    const isFounderMember = company.members.some((member) => member.userId === user.id);
    if (isFounderMember) {
      return;
    }

    if (mode === 'read' && user.roles.includes('INVESTOR') && company.status === 'APPROVED') {
      return;
    }

    throw new ForbiddenException('You do not have access to this company.');
  }

  async assertOrganizationAccess(user: AuthenticatedUser, organizationId: string) {
    if (this.isAdmin(user)) {
      return;
    }

    const member = await this.prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId, userId: user.id } }
    });
    if (!member) {
      throw new ForbiddenException('You do not have access to this organization.');
    }
  }

  scoreMatch(company: any, preference: any) {
    let score = 0;
    const factors: Record<string, number> = {};
    const sectors = Array.isArray(preference?.sectors) ? preference.sectors : [];
    const stages = Array.isArray(preference?.stages) ? preference.stages : [];
    const geographies = Array.isArray(preference?.geographies) ? preference.geographies : [];

    factors.sector = company.sector && sectors.includes(company.sector) ? 20 : sectors.length ? 0 : 10;
    factors.stage = company.stage && stages.includes(company.stage) ? 15 : stages.length ? 0 : 8;
    factors.geography = company.country && geographies.includes(company.country) ? 10 : geographies.length ? 0 : 5;
    factors.ticket = 15;
    factors.businessModel = 10;
    factors.traction = company.metrics?.annualRevenue || company.metrics?.monthlyRecurringRevenue ? 10 : 3;
    factors.valuation = 10;
    factors.mandate = 5;
    factors.thesis = preference?.thesis && company.description ? 5 : 2;
    score = Object.values(factors).reduce((sum, item) => sum + item, 0);

    return {
      totalScore: Math.min(100, score),
      deterministicScore: Math.min(95, score - factors.thesis),
      llmScore: factors.thesis,
      fitLevel: score >= 80 ? 'excellent' : score >= 65 ? 'high' : score >= 45 ? 'medium' : 'low',
      factors
    };
  }

  async refreshMatches(companyId?: string, organizationId?: string) {
    const companies = await this.prisma.company.findMany({
      where: { status: 'APPROVED', ...(companyId ? { id: companyId } : {}) },
      include: { metrics: true }
    });
    const organizations = await this.prisma.organization.findMany({
      where: { status: 'ACTIVE', ...(organizationId ? { id: organizationId } : {}) },
      include: { preferences: true }
    });

    const results = [];
    for (const company of companies) {
      for (const organization of organizations) {
        const preference = organization.preferences[0];
        const match = this.scoreMatch(company, preference);
        const saved = await this.prisma.match.upsert({
          where: { companyId_organizationId: { companyId: company.id, organizationId: organization.id } },
          update: {
            totalScore: match.totalScore,
            deterministicScore: match.deterministicScore,
            llmScore: match.llmScore,
            fitLevel: match.fitLevel,
            factorsJson: match.factors,
            explanation: `${organization.name} is a ${match.fitLevel} fit for ${company.name}.`
          },
          create: {
            companyId: company.id,
            organizationId: organization.id,
            totalScore: match.totalScore,
            deterministicScore: match.deterministicScore,
            llmScore: match.llmScore,
            fitLevel: match.fitLevel,
            factorsJson: match.factors,
            explanation: `${organization.name} is a ${match.fitLevel} fit for ${company.name}.`
          }
        });
        results.push(saved);
      }
    }
    return results;
  }
}

