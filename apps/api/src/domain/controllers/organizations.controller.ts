import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { DomainService } from '../domain.service';
import { pickFields, requireFields } from '../payload';

const editableOrganizationFields = ['name', 'type', 'country', 'city', 'website', 'description'] as const;

@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly prisma: PrismaService, private readonly domain: DomainService) {}

  @Post()
  async create(@CurrentUser() user: AuthenticatedUser, @Body() body: any) {
    requireFields(body, ['name']);
    const organization = await this.prisma.organization.create({
      data: {
        name: body.name,
        type: body.type ?? 'VC',
        status: 'PENDING',
        country: body.country,
        city: body.city,
        website: body.website,
        description: body.description,
        members: { create: { userId: user.id, role: 'OWNER' } }
      }
    });
    await this.domain.audit(user.id, 'organization.create', 'Organization', organization.id);
    return organization;
  }

  @Get(':organizationId')
  async get(@CurrentUser() user: AuthenticatedUser, @Param('organizationId') organizationId: string) {
    await this.domain.assertOrganizationAccess(user, organizationId);
    return this.prisma.organization.findUniqueOrThrow({ where: { id: organizationId }, include: { members: { include: { user: true } } } });
  }

  @Patch(':organizationId')
  async update(@CurrentUser() user: AuthenticatedUser, @Param('organizationId') organizationId: string, @Body() body: any) {
    await this.domain.assertOrganizationAccess(user, organizationId);
    const organization = await this.prisma.organization.update({ where: { id: organizationId }, data: pickFields(body, editableOrganizationFields) });
    await this.domain.audit(user.id, 'organization.update', 'Organization', organizationId);
    return organization;
  }

  @Get(':organizationId/members')
  async members(@CurrentUser() user: AuthenticatedUser, @Param('organizationId') organizationId: string) {
    await this.domain.assertOrganizationAccess(user, organizationId);
    return this.prisma.organizationMember.findMany({ where: { organizationId }, include: { user: true } });
  }

  @Post(':organizationId/invitations')
  async invite(@CurrentUser() user: AuthenticatedUser, @Param('organizationId') organizationId: string, @Body() body: any) {
    await this.domain.assertOrganizationAccess(user, organizationId);
    const invited = await this.prisma.user.findUnique({ where: { email: String(body.email).toLowerCase() } });
    if (!invited) return { success: true, message: 'Invitation placeholder created.' };
    return this.prisma.organizationMember.upsert({
      where: { organizationId_userId: { organizationId, userId: invited.id } },
      update: { role: body.role ?? 'MEMBER' },
      create: { organizationId, userId: invited.id, role: body.role ?? 'MEMBER' }
    });
  }

  @Patch(':organizationId/members/:memberId/role')
  async role(@CurrentUser() user: AuthenticatedUser, @Param('organizationId') organizationId: string, @Param('memberId') memberId: string, @Body() body: any) {
    await this.domain.assertOrganizationAccess(user, organizationId);
    return this.prisma.organizationMember.update({ where: { id: memberId }, data: { role: body.role ?? 'MEMBER' } });
  }

  @Delete(':organizationId/members/:memberId')
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('organizationId') organizationId: string, @Param('memberId') memberId: string) {
    await this.domain.assertOrganizationAccess(user, organizationId);
    await this.prisma.organizationMember.delete({ where: { id: memberId } });
    return { success: true };
  }
}

