import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { DomainService } from '../domain.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class MatchingController {
  constructor(private readonly prisma: PrismaService, private readonly domain: DomainService) {}

  @Post('matches/refresh')
  async refresh(@CurrentUser() user: AuthenticatedUser) {
    const organizationId = await this.domain.getPrimaryOrganizationId(user.id);
    return this.domain.refreshMatches(undefined, organizationId ?? undefined, user.id);
  }

  @Post('companies/:companyId/matches/refresh')
  async refreshCompany(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string) {
    await this.domain.assertCompanyAccess(user, companyId, 'read');
    return this.domain.refreshMatches(companyId, undefined, user.id);
  }

  @Get('companies/:companyId/matched-investors')
  async matchedInvestors(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string) {
    await this.domain.assertCompanyAccess(user, companyId, 'read');
    return this.prisma.match.findMany({ where: { companyId }, include: { organization: true }, orderBy: { totalScore: 'desc' } });
  }

  @Get('matches/:matchId')
  async match(@CurrentUser() user: AuthenticatedUser, @Param('matchId') matchId: string) {
    const match = await this.prisma.match.findUniqueOrThrow({ where: { id: matchId }, include: { company: true, organization: true } });
    if (this.domain.isAdmin(user)) return match;
    if (user.roles.includes('INVESTOR')) await this.domain.assertOrganizationAccess(user, match.organizationId);
    else await this.domain.assertCompanyAccess(user, match.companyId, 'read');
    return match;
  }

  @Patch('matches/:matchId/status')
  async update(@CurrentUser() user: AuthenticatedUser, @Param('matchId') matchId: string, @Body() body: any) {
    const match = await this.prisma.match.findUniqueOrThrow({ where: { id: matchId } });
    if (this.domain.isAdmin(user)) {
      return this.prisma.match.update({ where: { id: matchId }, data: { status: body.status } });
    }
    await this.domain.assertOrganizationAccess(user, match.organizationId);
    return this.prisma.match.update({ where: { id: matchId }, data: { status: body.status } });
  }

  @Get('admin/matches')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  adminMatches() {
    return this.prisma.match.findMany({ include: { company: true, organization: true }, orderBy: { totalScore: 'desc' } });
  }
}

