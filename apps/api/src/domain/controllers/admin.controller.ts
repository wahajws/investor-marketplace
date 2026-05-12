import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { DomainService } from '../domain.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService, private readonly domain: DomainService) {}

  @Get('dashboard/summary')
  async summary() {
    const [users, companies, organizations, matches] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.company.count(),
      this.prisma.organization.count(),
      this.prisma.match.count()
    ]);
    return { users, companies, organizations, matches };
  }

  @Get('dashboard/pending-actions')
  async pending() {
    return {
      users: await this.prisma.user.count({ where: { status: 'PENDING' } }),
      organizations: await this.prisma.organization.count({ where: { status: 'PENDING' } }),
      companies: await this.prisma.company.count({ where: { status: { in: ['SUBMITTED', 'ADMIN_REVIEW'] } } })
    };
  }

  @Get('dashboard/risk-summary')
  async risk() {
    return {
      highRiskFlags: await this.prisma.redFlag.count({ where: { severity: { in: ['HIGH', 'CRITICAL'] } } }),
      unsupportedClaims: await this.prisma.claim.count({ where: { verificationStatus: 'UNSUPPORTED' } })
    };
  }

  @Get('users')
  users(@Query('search') search?: string, @Query('role') role?: string, @Query('status') status?: any) {
    return this.prisma.user.findMany({
      where: {
        ...(search ? { email: { contains: search } } : {}),
        ...(status ? { status } : {}),
        ...(role ? { roles: { some: { role: { name: role as any } } } } : {})
      },
      include: { roles: { include: { role: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Get('users/:userId')
  user(@Param('userId') userId: string) {
    return this.prisma.user.findUniqueOrThrow({ where: { id: userId }, include: { roles: { include: { role: true } } } });
  }

  @Patch('users/:userId/status')
  async userStatus(@CurrentUser() user: AuthenticatedUser, @Param('userId') userId: string, @Body() body: any) {
    const updated = await this.prisma.user.update({ where: { id: userId }, data: { status: body.status } });
    await this.domain.audit(user.id, 'admin.user.status', 'User', userId, body);
    return updated;
  }

  @Patch('users/:userId/roles')
  async userRoles(@CurrentUser() user: AuthenticatedUser, @Param('userId') userId: string, @Body() body: any) {
    const roleNames = Array.isArray(body.roles) ? body.roles : [];
    const roles = await this.prisma.role.findMany({ where: { name: { in: roleNames } } });
    await this.prisma.userRole.deleteMany({ where: { userId } });
    await this.prisma.userRole.createMany({ data: roles.map((role) => ({ userId, roleId: role.id })) });
    await this.domain.audit(user.id, 'admin.user.roles', 'User', userId, body);
    return this.user(userId);
  }

  @Delete('users/:userId')
  async deleteUser(@CurrentUser() user: AuthenticatedUser, @Param('userId') userId: string) {
    const updated = await this.prisma.user.update({ where: { id: userId }, data: { status: 'DEACTIVATED' } });
    await this.domain.audit(user.id, 'admin.user.delete', 'User', userId);
    return updated;
  }

  @Get('organizations')
  organizations() {
    return this.prisma.organization.findMany({ include: { members: true }, orderBy: { createdAt: 'desc' } });
  }

  @Patch('organizations/:organizationId/status')
  async organizationStatus(@CurrentUser() user: AuthenticatedUser, @Param('organizationId') organizationId: string, @Body() body: any) {
    const updated = await this.prisma.organization.update({ where: { id: organizationId }, data: { status: body.status } });
    await this.domain.audit(user.id, 'admin.organization.status', 'Organization', organizationId, body);
    return updated;
  }

  @Get('companies')
  companies() {
    return this.prisma.company.findMany({ include: { metrics: true, fundraising: true, members: true }, orderBy: { createdAt: 'desc' } });
  }

  @Get('companies/:companyId')
  company(@Param('companyId') companyId: string) {
    return this.prisma.company.findUniqueOrThrow({
      where: { id: companyId },
      include: { metrics: true, fundraising: true, members: true, documents: true, claims: true, redFlags: true, valuations: true, readinessScores: true }
    });
  }

  @Patch('companies/:companyId/status')
  async companyStatus(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string, @Body() body: any) {
    const updated = await this.prisma.company.update({
      where: { id: companyId },
      data: { status: body.status, reviewedAt: new Date(), reviewNote: body.reviewNote }
    });
    await this.domain.audit(user.id, 'admin.company.status', 'Company', companyId, body);
    return updated;
  }

  @Patch('companies/:companyId/visibility')
  async companyVisibility(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string, @Body() body: any) {
    const updated = await this.prisma.company.update({ where: { id: companyId }, data: { visibility: body.visibility } });
    await this.domain.audit(user.id, 'admin.company.visibility', 'Company', companyId, body);
    return updated;
  }

  @Get('settings')
  settings() {
    return this.prisma.platformSetting.findMany();
  }

  @Patch('settings/:key')
  setting(@Param('key') key: string, @Body() body: any) {
    return this.prisma.platformSetting.upsert({ where: { key }, update: { valueJson: body.value ?? body }, create: { key, valueJson: body.value ?? body } });
  }

  @Get('settings/:type')
  options(@Param('type') type: string) {
    return this.prisma.platformSetting.findUnique({ where: { key: type } });
  }

  @Get('matches')
  matches() {
    return this.prisma.match.findMany({ include: { company: true, organization: true }, orderBy: { totalScore: 'desc' } });
  }

  @Get('audit-logs')
  auditLogs() {
    return this.prisma.auditLog.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' }, take: 200 });
  }

  @Get('audit-logs/:auditLogId')
  auditLog(@Param('auditLogId') auditLogId: string) {
    return this.prisma.auditLog.findUniqueOrThrow({ where: { id: auditLogId }, include: { user: true } });
  }
}

