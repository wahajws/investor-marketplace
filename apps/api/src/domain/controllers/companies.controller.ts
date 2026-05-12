import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { DomainService } from '../domain.service';

@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly prisma: PrismaService, private readonly domain: DomainService) {}

  @Post()
  async create(@CurrentUser() user: AuthenticatedUser, @Body() body: any) {
    const company = await this.prisma.company.create({
      data: {
        name: body.name,
        registrationNumber: body.registrationNumber,
        country: body.country,
        city: body.city,
        sector: body.sector,
        businessModel: body.businessModel,
        stage: body.stage,
        website: body.website,
        description: body.description,
        problem: body.problem,
        solution: body.solution,
        targetCustomers: body.targetCustomers,
        members: { create: { userId: user.id, name: body.founderName ?? user.email, role: 'Founder' } }
      }
    });
    await this.domain.audit(user.id, 'company.create', 'Company', company.id);
    return company;
  }

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser, @Query('search') search?: string) {
    const where: any = search ? { name: { contains: search } } : {};
    if (!this.domain.isAdmin(user) && user.roles.includes('FOUNDER')) where.members = { some: { userId: user.id } };
    if (!this.domain.isAdmin(user) && user.roles.includes('INVESTOR')) where.status = 'APPROVED';
    return this.prisma.company.findMany({ where, include: { metrics: true, fundraising: true }, orderBy: { createdAt: 'desc' } });
  }

  @Get(':companyId')
  async get(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string) {
    await this.domain.assertCompanyAccess(user, companyId, 'read');
    return this.prisma.company.findUniqueOrThrow({
      where: { id: companyId },
      include: { metrics: true, fundraising: true, members: true, documents: true, claims: true, redFlags: true, valuations: { orderBy: { createdAt: 'desc' } }, readinessScores: { orderBy: { createdAt: 'desc' } } }
    });
  }

  @Patch(':companyId')
  async update(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string, @Body() body: any) {
    await this.domain.assertCompanyAccess(user, companyId, 'write');
    return this.prisma.company.update({ where: { id: companyId }, data: body });
  }

  @Post(':companyId/submit')
  async submit(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string) {
    await this.domain.assertCompanyAccess(user, companyId, 'write');
    return this.prisma.company.update({ where: { id: companyId }, data: { status: 'SUBMITTED', submittedAt: new Date() } });
  }

  @Post(':companyId/archive')
  async archive(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string) {
    await this.domain.assertCompanyAccess(user, companyId, 'write');
    return this.prisma.company.update({ where: { id: companyId }, data: { status: 'ARCHIVED' } });
  }

  @Get(':companyId/team')
  async team(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string) {
    await this.domain.assertCompanyAccess(user, companyId, 'read');
    return this.prisma.companyMember.findMany({ where: { companyId } });
  }

  @Post(':companyId/team')
  async addTeam(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string, @Body() body: any) {
    await this.domain.assertCompanyAccess(user, companyId, 'write');
    return this.prisma.companyMember.create({ data: { companyId, name: body.name, role: body.role, email: body.email, ownership: body.ownership, bio: body.bio } });
  }

  @Patch(':companyId/team/:memberId')
  async updateTeam(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string, @Param('memberId') memberId: string, @Body() body: any) {
    await this.domain.assertCompanyAccess(user, companyId, 'write');
    return this.prisma.companyMember.update({ where: { id: memberId }, data: body });
  }

  @Delete(':companyId/team/:memberId')
  async deleteTeam(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string, @Param('memberId') memberId: string) {
    await this.domain.assertCompanyAccess(user, companyId, 'write');
    await this.prisma.companyMember.delete({ where: { id: memberId } });
    return { success: true };
  }

  @Get(':companyId/metrics')
  async metrics(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string) {
    await this.domain.assertCompanyAccess(user, companyId, 'read');
    return this.prisma.companyMetric.findUnique({ where: { companyId } });
  }

  @Put(':companyId/metrics')
  async upsertMetrics(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string, @Body() body: any) {
    await this.domain.assertCompanyAccess(user, companyId, 'write');
    return this.prisma.companyMetric.upsert({ where: { companyId }, update: body, create: { ...body, companyId } });
  }

  @Patch(':companyId/metrics')
  updateMetrics(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string, @Body() body: any) {
    return this.upsertMetrics(user, companyId, body);
  }

  @Get(':companyId/fundraising')
  async fundraising(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string) {
    await this.domain.assertCompanyAccess(user, companyId, 'read');
    return this.prisma.fundraisingRound.findUnique({ where: { companyId } });
  }

  @Put(':companyId/fundraising')
  async upsertFundraising(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string, @Body() body: any) {
    await this.domain.assertCompanyAccess(user, companyId, 'write');
    return this.prisma.fundraisingRound.upsert({ where: { companyId }, update: body, create: { ...body, companyId } });
  }

  @Patch(':companyId/fundraising')
  updateFundraising(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string, @Body() body: any) {
    return this.upsertFundraising(user, companyId, body);
  }
}

