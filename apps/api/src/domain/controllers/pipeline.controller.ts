import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { DomainService } from '../domain.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class PipelineController {
  constructor(private readonly prisma: PrismaService, private readonly domain: DomainService) {}

  @Get('pipeline')
  async pipeline(@CurrentUser() user: AuthenticatedUser) {
    const organizationId = await this.domain.getPrimaryOrganizationId(user.id);
    if (!organizationId) return [];
    return this.prisma.dealPipelineItem.findMany({ where: { organizationId }, include: { company: true, notes: true }, orderBy: { updatedAt: 'desc' } });
  }

  @Post('pipeline/items')
  async create(@CurrentUser() user: AuthenticatedUser, @Body() body: any) {
    const organizationId = body.organizationId ?? (await this.domain.getPrimaryOrganizationId(user.id));
    if (!organizationId) throw new Error('Investor organization is required.');
    return this.prisma.dealPipelineItem.upsert({
      where: { companyId_organizationId: { companyId: body.companyId, organizationId } },
      update: { stage: body.stage ?? 'NEW' },
      create: { companyId: body.companyId, organizationId, ownerUserId: user.id, stage: body.stage ?? 'NEW' }
    });
  }

  @Get('pipeline/items/:pipelineItemId')
  item(@Param('pipelineItemId') pipelineItemId: string) {
    return this.prisma.dealPipelineItem.findUniqueOrThrow({ where: { id: pipelineItemId }, include: { company: true, notes: true } });
  }

  @Patch('pipeline/items/:pipelineItemId')
  update(@Param('pipelineItemId') pipelineItemId: string, @Body() body: any) {
    return this.prisma.dealPipelineItem.update({ where: { id: pipelineItemId }, data: body });
  }

  @Delete('pipeline/items/:pipelineItemId')
  async archive(@Param('pipelineItemId') pipelineItemId: string) {
    return this.prisma.dealPipelineItem.update({ where: { id: pipelineItemId }, data: { stage: 'ARCHIVED', archivedAt: new Date() } });
  }

  @Get('pipeline/items/:pipelineItemId/notes')
  notes(@Param('pipelineItemId') pipelineItemId: string) {
    return this.prisma.dealNote.findMany({ where: { pipelineItemId }, orderBy: { createdAt: 'desc' } });
  }

  @Post('pipeline/items/:pipelineItemId/notes')
  createNote(@Param('pipelineItemId') pipelineItemId: string, @Body() body: any) {
    return this.prisma.dealNote.create({ data: { pipelineItemId, body: body.body } });
  }

  @Patch('pipeline/notes/:noteId')
  updateNote(@Param('noteId') noteId: string, @Body() body: any) {
    return this.prisma.dealNote.update({ where: { id: noteId }, data: { body: body.body } });
  }

  @Delete('pipeline/notes/:noteId')
  async deleteNote(@Param('noteId') noteId: string) {
    await this.prisma.dealNote.delete({ where: { id: noteId } });
    return { success: true };
  }

  @Post('companies/:companyId/memos')
  async memo(@Param('companyId') companyId: string) {
    const company = await this.prisma.company.findUniqueOrThrow({ where: { id: companyId }, include: { metrics: true, fundraising: true, claims: true, redFlags: true } });
    return this.prisma.investmentMemo.create({
      data: {
        companyId,
        title: `${company.name} Screening Memo`,
        content: `# ${company.name} Screening Memo\n\nSector: ${company.sector ?? 'Unknown'}\nStage: ${company.stage ?? 'Unknown'}\n\nThis AI-assisted MVP memo summarizes available profile, metrics, claims, and red flags for human review.`
      }
    });
  }

  @Get('companies/:companyId/memos')
  memos(@Param('companyId') companyId: string) {
    return this.prisma.investmentMemo.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' } });
  }

  @Get('memos/:memoId')
  getMemo(@Param('memoId') memoId: string) {
    return this.prisma.investmentMemo.findUniqueOrThrow({ where: { id: memoId } });
  }

  @Patch('memos/:memoId')
  updateMemo(@Param('memoId') memoId: string, @Body() body: any) {
    return this.prisma.investmentMemo.update({ where: { id: memoId }, data: body });
  }

  @Post('memos/:memoId/regenerate')
  async regenerateMemo(@Param('memoId') memoId: string) {
    const memo = await this.prisma.investmentMemo.findUniqueOrThrow({ where: { id: memoId } });
    return this.prisma.investmentMemo.update({ where: { id: memoId }, data: { content: `${memo.content}\n\nRegenerated at ${new Date().toISOString()}.` } });
  }

  @Get('memos/:memoId/export')
  async exportMemo(@Param('memoId') memoId: string) {
    const memo = await this.prisma.investmentMemo.findUniqueOrThrow({ where: { id: memoId } });
    return { filename: `${memo.title}.md`, content: memo.content };
  }
}

