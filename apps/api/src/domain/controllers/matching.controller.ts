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
    return this.domain.refreshMatches(undefined, organizationId ?? undefined);
  }

  @Post('companies/:companyId/matches/refresh')
  async refreshCompany(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string) {
    await this.domain.assertCompanyAccess(user, companyId, 'read');
    return this.domain.refreshMatches(companyId);
  }

  @Get('companies/:companyId/matched-investors')
  async matchedInvestors(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string) {
    await this.domain.assertCompanyAccess(user, companyId, 'read');
    return this.prisma.match.findMany({ where: { companyId }, include: { organization: true }, orderBy: { totalScore: 'desc' } });
  }

  @Get('matches/:matchId')
  match(@Param('matchId') matchId: string) {
    return this.prisma.match.findUniqueOrThrow({ where: { id: matchId }, include: { company: true, organization: true } });
  }

  @Patch('matches/:matchId/status')
  update(@Param('matchId') matchId: string, @Body() body: any) {
    return this.prisma.match.update({ where: { id: matchId }, data: { status: body.status } });
  }

  @Get('admin/matches')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  adminMatches() {
    return this.prisma.match.findMany({ include: { company: true, organization: true }, orderBy: { totalScore: 'desc' } });
  }
}

