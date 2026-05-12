import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { DomainService } from '../domain.service';
import { requireEnum, requireFields } from '../payload';

const requestStatuses = ['OPEN', 'WAITING_FOR_FOUNDER', 'WAITING_FOR_INVESTOR', 'RESOLVED', 'CLOSED'] as const;

@UseGuards(JwtAuthGuard)
@Controller()
export class RequestsController {
  constructor(private readonly prisma: PrismaService, private readonly domain: DomainService) {}

  @Post('companies/:companyId/requests')
  async create(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string, @Body() body: any) {
    await this.domain.assertCompanyAccess(user, companyId, 'read');
    requireFields(body, ['body']);
    const organizationId = body.organizationId ?? (await this.domain.getPrimaryOrganizationId(user.id));
    const request = await this.prisma.informationRequest.create({ data: { companyId, organizationId, title: body.title ?? 'Investor information request', body: body.body, status: 'WAITING_FOR_FOUNDER' } });
    const members = await this.prisma.companyMember.findMany({ where: { companyId, userId: { not: null } }, select: { userId: true } });
    await this.prisma.notification.createMany({
      data: members.map((member) => ({
        userId: member.userId as string,
        title: 'New investor information request',
        body: request.title
      }))
    });
    return request;
  }

  @Get('requests')
  async list(@CurrentUser() user: AuthenticatedUser) {
    if (user.roles.includes('INVESTOR')) {
      const organizationId = await this.domain.getPrimaryOrganizationId(user.id);
      return organizationId ? this.prisma.informationRequest.findMany({ where: { organizationId }, include: { company: true, responses: true } }) : [];
    }
    const companies = await this.prisma.company.findMany({ where: { members: { some: { userId: user.id } } }, select: { id: true } });
    return this.prisma.informationRequest.findMany({ where: { companyId: { in: companies.map((company) => company.id) } }, include: { company: true, responses: true } });
  }

  @Get('requests/:requestId')
  get(@CurrentUser() user: AuthenticatedUser, @Param('requestId') requestId: string) {
    return this.domain.assertRequestAccess(user, requestId);
  }

  @Post('requests/:requestId/responses')
  async response(@CurrentUser() user: AuthenticatedUser, @Param('requestId') requestId: string, @Body() body: any) {
    await this.domain.assertRequestAccess(user, requestId);
    requireFields(body, ['body']);
    const response = await this.prisma.informationRequestResponse.create({ data: { requestId, body: body.body } });
    await this.prisma.informationRequest.update({ where: { id: requestId }, data: { status: user.roles.includes('FOUNDER') ? 'WAITING_FOR_INVESTOR' : 'WAITING_FOR_FOUNDER' } });
    return response;
  }

  @Patch('requests/:requestId/status')
  async status(@CurrentUser() user: AuthenticatedUser, @Param('requestId') requestId: string, @Body() body: any) {
    await this.domain.assertRequestAccess(user, requestId);
    return this.prisma.informationRequest.update({ where: { id: requestId }, data: { status: requireEnum(body.status, requestStatuses, 'Request status') } });
  }

  @Post('requests/:requestId/documents')
  async attach(@CurrentUser() user: AuthenticatedUser, @Param('requestId') requestId: string) {
    await this.domain.assertRequestAccess(user, requestId);
    return { success: true, requestId };
  }
}

