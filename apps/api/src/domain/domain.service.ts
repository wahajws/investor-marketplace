import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { LlmService } from './llm.service';

@Injectable()
export class DomainService {
  constructor(private readonly prisma: PrismaService, private readonly llm: LlmService) {}

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

  async assertRequestAccess(user: AuthenticatedUser, requestId: string) {
    if (this.isAdmin(user)) {
      return this.prisma.informationRequest.findUniqueOrThrow({
        where: { id: requestId },
        include: { company: { include: { members: true } }, responses: true }
      });
    }

    const request = await this.prisma.informationRequest.findUnique({
      where: { id: requestId },
      include: { company: { include: { members: true } }, responses: true }
    });
    if (!request) {
      throw new NotFoundException('Information request not found.');
    }

    const isFounder = request.company.members.some((member) => member.userId === user.id);
    if (isFounder) {
      return request;
    }

    const organizationId = await this.getPrimaryOrganizationId(user.id);
    if (organizationId && request.organizationId === organizationId) {
      return request;
    }

    throw new ForbiddenException('You do not have access to this request.');
  }

  async assertPipelineItemAccess(user: AuthenticatedUser, pipelineItemId: string) {
    if (this.isAdmin(user)) {
      return this.prisma.dealPipelineItem.findUniqueOrThrow({
        where: { id: pipelineItemId },
        include: { company: true, notes: true }
      });
    }

    const item = await this.prisma.dealPipelineItem.findUnique({
      where: { id: pipelineItemId },
      include: { company: true, notes: true }
    });
    if (!item) {
      throw new NotFoundException('Pipeline item not found.');
    }

    const organizationId = await this.getPrimaryOrganizationId(user.id);
    if (organizationId && item.organizationId === organizationId) {
      return item;
    }

    throw new ForbiddenException('You do not have access to this pipeline item.');
  }

  async assertMemoAccess(user: AuthenticatedUser, memoId: string) {
    const memo = await this.prisma.investmentMemo.findUnique({
      where: { id: memoId },
      include: { company: { include: { members: true } } }
    });
    if (!memo) {
      throw new NotFoundException('Memo not found.');
    }
    await this.assertCompanyAccess(user, memo.companyId, 'read');
    return memo;
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

  async refreshMatches(companyId?: string, organizationId?: string, userId?: string) {
    const companies = await this.prisma.company.findMany({
      where: { status: 'APPROVED', ...(companyId ? { id: companyId } : {}) },
      include: { metrics: true, fundraising: true, claims: true, redFlags: true }
    });
    const organizations = await this.prisma.organization.findMany({
      where: { status: 'ACTIVE', ...(organizationId ? { id: organizationId } : {}) },
      include: { preferences: true }
    });

    const results = [];
    for (const company of companies) {
      for (const organization of organizations) {
        const preference = organization.preferences[0];
        const deterministic = this.scoreMatch(company, preference);
        const ai = await this.llm.runRequiredJson({
          userId,
          companyId: company.id,
          task: 'investor_startup_match',
          system: 'You are an investor-startup matching analyst. Return only valid JSON and do not provide investment advice.',
          user: JSON.stringify({
            company,
            organization,
            preference,
            deterministic,
            instruction: 'Assess investor thesis fit. Return totalScore 0-100, llmScore 0-25, fitLevel, factors, explanation, founderAdvice, and investorNextAction.'
          }),
          fallback: {}
        });
        const totalScore = Math.max(0, Math.min(100, Number((ai as any).totalScore ?? deterministic.totalScore)));
        const llmScore = Math.max(0, Math.min(25, Number((ai as any).llmScore ?? deterministic.llmScore)));
        const factors = (ai as any).factors ?? deterministic.factors;
        const fitLevel = String((ai as any).fitLevel ?? deterministic.fitLevel);
        const explanation = String((ai as any).explanation ?? `${organization.name} is a ${fitLevel} fit for ${company.name}.`);
        const saved = await this.prisma.match.upsert({
          where: { companyId_organizationId: { companyId: company.id, organizationId: organization.id } },
          update: {
            totalScore,
            deterministicScore: deterministic.deterministicScore,
            llmScore,
            fitLevel,
            factorsJson: JSON.parse(JSON.stringify(factors)),
            explanation
          },
          create: {
            companyId: company.id,
            organizationId: organization.id,
            totalScore,
            deterministicScore: deterministic.deterministicScore,
            llmScore,
            fitLevel,
            factorsJson: JSON.parse(JSON.stringify(factors)),
            explanation
          }
        });
        results.push(saved);
      }
    }
    return results;
  }
}

