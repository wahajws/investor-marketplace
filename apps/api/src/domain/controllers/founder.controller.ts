import { Body, Controller, Get, Patch, Put, UseGuards } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { pickFields } from '../payload';

const editableFounderProfileFields = [
  'fullName',
  'phone',
  'country',
  'city',
  'linkedinUrl',
  'role',
  'biography',
  'experience',
  'education'
] as const;

@UseGuards(JwtAuthGuard)
@Controller('founder')
export class FounderController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.prisma.founderProfile.findUnique({ where: { userId: user.id } });
  }

  @Put('profile')
  upsertProfile(@CurrentUser() user: AuthenticatedUser, @Body() body: any) {
    const data = pickFields(body, editableFounderProfileFields);
    return this.prisma.founderProfile.upsert({
      where: { userId: user.id },
      update: data,
      create: { ...data, userId: user.id }
    });
  }

  @Patch('profile')
  updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() body: any) {
    return this.upsertProfile(user, body);
  }

  @Get('dashboard/summary')
  async summary(@CurrentUser() user: AuthenticatedUser) {
    const companies = await this.prisma.company.findMany({
      where: { members: { some: { userId: user.id } } },
      include: { readinessScores: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });
    return {
      companies: companies.length,
      latestCompany: companies[0] ?? null,
      readinessScore: companies[0]?.readinessScores[0]?.overallScore ?? null
    };
  }

  @Get('dashboard/recommendations')
  async recommendations(@CurrentUser() user: AuthenticatedUser) {
    const company = await this.prisma.company.findFirst({
      where: { members: { some: { userId: user.id } } },
      include: { documents: true, metrics: true, fundraising: true }
    });
    if (!company) return { recommendations: ['Create your startup profile.'] };
    const recommendations = [];
    if (!company.documents.length) recommendations.push('Upload a pitch deck or financial document.');
    if (!company.metrics) recommendations.push('Add company metrics.');
    if (!company.fundraising) recommendations.push('Add fundraising details.');
    return { recommendations };
  }

  @Get('dashboard/investor-interest')
  async interest(@CurrentUser() user: AuthenticatedUser) {
    const companyIds = (
      await this.prisma.company.findMany({ where: { members: { some: { userId: user.id } } }, select: { id: true } })
    ).map((company) => company.id);
    const matches = await this.prisma.match.count({ where: { companyId: { in: companyIds } } });
    const requests = await this.prisma.informationRequest.count({ where: { companyId: { in: companyIds } } });
    return { matches, requests };
  }
}

