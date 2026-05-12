import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { DomainService } from '../domain.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class RequestsController {
  constructor(private readonly prisma: PrismaService, private readonly domain: DomainService) {}

  @Post('companies/:companyId/requests')
  async create(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string, @Body() body: any) {
    const organizationId = body.organizationId ?? (await this.domain.getPrimaryOrganizationId(user.id));
    return this.prisma.informationRequest.create({ data: { companyId, organizationId, title: body.title, body: body.body, status: 'WAITING_FOR_FOUNDER' } });
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
  get(@Param('requestId') requestId: string) {
    return this.prisma.informationRequest.findUniqueOrThrow({ where: { id: requestId }, include: { company: true, responses: true } });
  }

  @Post('requests/:requestId/responses')
  response(@Param('requestId') requestId: string, @Body() body: any) {
    return this.prisma.informationRequestResponse.create({ data: { requestId, body: body.body } });
  }

  @Patch('requests/:requestId/status')
  status(@Param('requestId') requestId: string, @Body() body: any) {
    return this.prisma.informationRequest.update({ where: { id: requestId }, data: { status: body.status } });
  }

  @Post('requests/:requestId/documents')
  attach(@Param('requestId') requestId: string) {
    return { success: true, requestId };
  }
}

