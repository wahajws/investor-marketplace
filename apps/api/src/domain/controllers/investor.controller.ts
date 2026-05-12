import { Body, Controller, Get, Patch, Put, UseGuards } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { DomainService } from '../domain.service';
import { pickFields } from '../payload';

const editableInvestorProfileFields = ['organizationId', 'fullName', 'phone', 'country', 'city', 'linkedinUrl', 'title', 'bio'] as const;
const editableInvestorPreferenceFields = [
  'thesis',
  'sectors',
  'stages',
  'geographies',
  'excludedSectors',
  'minTicketSize',
  'maxTicketSize',
  'revenueRequirement',
  'riskPreference',
  'leadPreference'
] as const;

@UseGuards(JwtAuthGuard)
@Controller('investor')
export class InvestorController {
  constructor(private readonly prisma: PrismaService, private readonly domain: DomainService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.prisma.investorProfile.findUnique({ where: { userId: user.id }, include: { preferences: true } });
  }

  @Put('profile')
  async upsertProfile(@CurrentUser() user: AuthenticatedUser, @Body() body: any) {
    const organizationId = body.organizationId ?? (await this.domain.getPrimaryOrganizationId(user.id));
    const data = { ...pickFields(body, editableInvestorProfileFields), organizationId };
    return this.prisma.investorProfile.upsert({
      where: { userId: user.id },
      update: data,
      create: { ...data, userId: user.id }
    });
  }

  @Patch('profile')
  updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() body: any) {
    return this.upsertProfile(user, body);
  }

  @Get('preferences')
  async getPreferences(@CurrentUser() user: AuthenticatedUser) {
    const profile = await this.prisma.investorProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return null;
    return this.prisma.investorPreference.findUnique({ where: { investorProfileId: profile.id } });
  }

  @Put('preferences')
  async upsertPreferences(@CurrentUser() user: AuthenticatedUser, @Body() body: any) {
    const data = pickFields(body, editableInvestorPreferenceFields);
    const profile = await this.prisma.investorProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, fullName: user.email }
    });
    return this.prisma.investorPreference.upsert({
      where: { investorProfileId: profile.id },
      update: data,
      create: { ...data, investorProfileId: profile.id, organizationId: profile.organizationId }
    });
  }

  @Patch('preferences')
  updatePreferences(@CurrentUser() user: AuthenticatedUser, @Body() body: any) {
    return this.upsertPreferences(user, body);
  }

  @Get('dashboard/summary')
  async summary(@CurrentUser() user: AuthenticatedUser) {
    const organizationId = await this.domain.getPrimaryOrganizationId(user.id);
    return {
      organizationId,
      matches: organizationId ? await this.prisma.match.count({ where: { organizationId } }) : 0,
      pipelineItems: organizationId ? await this.prisma.dealPipelineItem.count({ where: { organizationId } }) : 0
    };
  }

  @Get('dashboard/recommendations')
  async recommendations(@CurrentUser() user: AuthenticatedUser) {
    const organizationId = await this.domain.getPrimaryOrganizationId(user.id);
    if (!organizationId) return [];
    return this.prisma.match.findMany({ where: { organizationId }, include: { company: true }, orderBy: { totalScore: 'desc' }, take: 10 });
  }

  @Get('dashboard/pipeline-summary')
  async pipelineSummary(@CurrentUser() user: AuthenticatedUser) {
    const organizationId = await this.domain.getPrimaryOrganizationId(user.id);
    if (!organizationId) return [];
    return this.prisma.dealPipelineItem.groupBy({ by: ['stage'], where: { organizationId }, _count: true });
  }

  @Get('matched-startups')
  async matchedStartups(@CurrentUser() user: AuthenticatedUser) {
    const organizationId = await this.domain.getPrimaryOrganizationId(user.id);
    if (!organizationId) return [];
    return this.prisma.match.findMany({ where: { organizationId }, include: { company: { include: { metrics: true, fundraising: true } } }, orderBy: { totalScore: 'desc' } });
  }
}

