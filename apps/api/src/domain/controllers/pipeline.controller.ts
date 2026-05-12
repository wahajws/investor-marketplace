import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { DomainService } from '../domain.service';
import { LlmService } from '../llm.service';
import { pickFields, requireEnum, requireFields } from '../payload';

const pipelineStages = ['NEW', 'SCREENING', 'INTERESTED', 'DILIGENCE', 'PARTNER_REVIEW', 'INVESTMENT_COMMITTEE', 'TERM_SHEET', 'INVESTED', 'REJECTED', 'ARCHIVED'] as const;
const editablePipelineFields = ['stage', 'rating', 'nextActionAt'] as const;

@UseGuards(JwtAuthGuard)
@Controller()
export class PipelineController {
  constructor(private readonly prisma: PrismaService, private readonly domain: DomainService, private readonly llm: LlmService) {}

  @Get('pipeline')
  async pipeline(@CurrentUser() user: AuthenticatedUser) {
    const organizationId = await this.domain.getPrimaryOrganizationId(user.id);
    if (!organizationId) return [];
    return this.prisma.dealPipelineItem.findMany({ where: { organizationId }, include: { company: true, notes: true }, orderBy: { updatedAt: 'desc' } });
  }

  @Post('pipeline/items')
  async create(@CurrentUser() user: AuthenticatedUser, @Body() body: any) {
    requireFields(body, ['companyId']);
    const organizationId = body.organizationId ?? (await this.domain.getPrimaryOrganizationId(user.id));
    if (!organizationId) throw new BadRequestException('Investor organization is required.');
    await this.domain.assertOrganizationAccess(user, organizationId);
    await this.domain.assertCompanyAccess(user, body.companyId, 'read');
    const stage = body.stage ? requireEnum(body.stage, pipelineStages, 'Pipeline stage') : 'NEW';
    return this.prisma.dealPipelineItem.upsert({
      where: { companyId_organizationId: { companyId: body.companyId, organizationId } },
      update: { stage },
      create: { companyId: body.companyId, organizationId, ownerUserId: user.id, stage }
    });
  }

  @Get('pipeline/items/:pipelineItemId')
  item(@CurrentUser() user: AuthenticatedUser, @Param('pipelineItemId') pipelineItemId: string) {
    return this.domain.assertPipelineItemAccess(user, pipelineItemId);
  }

  @Patch('pipeline/items/:pipelineItemId')
  async update(@CurrentUser() user: AuthenticatedUser, @Param('pipelineItemId') pipelineItemId: string, @Body() body: any) {
    await this.domain.assertPipelineItemAccess(user, pipelineItemId);
    const data = pickFields(body, editablePipelineFields);
    if (data.stage) data.stage = requireEnum(data.stage, pipelineStages, 'Pipeline stage');
    return this.prisma.dealPipelineItem.update({ where: { id: pipelineItemId }, data });
  }

  @Delete('pipeline/items/:pipelineItemId')
  async archive(@CurrentUser() user: AuthenticatedUser, @Param('pipelineItemId') pipelineItemId: string) {
    await this.domain.assertPipelineItemAccess(user, pipelineItemId);
    return this.prisma.dealPipelineItem.update({ where: { id: pipelineItemId }, data: { stage: 'ARCHIVED', archivedAt: new Date() } });
  }

  @Get('pipeline/items/:pipelineItemId/notes')
  async notes(@CurrentUser() user: AuthenticatedUser, @Param('pipelineItemId') pipelineItemId: string) {
    await this.domain.assertPipelineItemAccess(user, pipelineItemId);
    return this.prisma.dealNote.findMany({ where: { pipelineItemId }, orderBy: { createdAt: 'desc' } });
  }

  @Post('pipeline/items/:pipelineItemId/notes')
  async createNote(@CurrentUser() user: AuthenticatedUser, @Param('pipelineItemId') pipelineItemId: string, @Body() body: any) {
    await this.domain.assertPipelineItemAccess(user, pipelineItemId);
    requireFields(body, ['body']);
    return this.prisma.dealNote.create({ data: { pipelineItemId, body: body.body } });
  }

  @Patch('pipeline/notes/:noteId')
  async updateNote(@CurrentUser() user: AuthenticatedUser, @Param('noteId') noteId: string, @Body() body: any) {
    const note = await this.prisma.dealNote.findUniqueOrThrow({ where: { id: noteId } });
    await this.domain.assertPipelineItemAccess(user, note.pipelineItemId);
    requireFields(body, ['body']);
    return this.prisma.dealNote.update({ where: { id: noteId }, data: { body: body.body } });
  }

  @Delete('pipeline/notes/:noteId')
  async deleteNote(@CurrentUser() user: AuthenticatedUser, @Param('noteId') noteId: string) {
    const note = await this.prisma.dealNote.findUniqueOrThrow({ where: { id: noteId } });
    await this.domain.assertPipelineItemAccess(user, note.pipelineItemId);
    await this.prisma.dealNote.delete({ where: { id: noteId } });
    return { success: true };
  }

  @Post('companies/:companyId/memos')
  async memo(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string) {
    await this.domain.assertCompanyAccess(user, companyId, 'read');
    const company = await this.prisma.company.findUniqueOrThrow({
      where: { id: companyId },
      include: { metrics: true, fundraising: true, claims: true, redFlags: true, documents: true, extractions: { orderBy: { createdAt: 'desc' }, take: 10 }, members: true }
    });
    const memo = await this.llm.runRequiredJson({
      userId: user.id,
      companyId,
      task: 'investment_memo',
      system: 'You are a VC investment memo analyst. Return only valid JSON. Do not provide investment advice.',
      user: JSON.stringify({
        company,
        instruction: 'Generate an investor screening memo. Return title and markdown content with sections: Executive Summary, Business Model, Market/ICP, Team, Traction, Fundraising/Valuation, Risks, Missing Diligence, Investor Questions, and Preliminary Recommendation.'
      }),
      fallback: {}
    });
    return this.prisma.investmentMemo.create({
      data: {
        companyId,
        title: String((memo as any).title ?? `${company.name} Screening Memo`),
        content: String((memo as any).content ?? `# ${company.name} Screening Memo\n\nAlibaba Qwen memo generation completed, but no content was returned.`)
      }
    });
  }

  @Get('companies/:companyId/memos')
  async memos(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string) {
    await this.domain.assertCompanyAccess(user, companyId, 'read');
    return this.prisma.investmentMemo.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' } });
  }

  @Get('memos/:memoId')
  async getMemo(@CurrentUser() user: AuthenticatedUser, @Param('memoId') memoId: string) {
    return this.domain.assertMemoAccess(user, memoId);
  }

  @Patch('memos/:memoId')
  async updateMemo(@CurrentUser() user: AuthenticatedUser, @Param('memoId') memoId: string, @Body() body: any) {
    await this.domain.assertMemoAccess(user, memoId);
    return this.prisma.investmentMemo.update({ where: { id: memoId }, data: pickFields(body, ['title', 'content'] as const) });
  }

  @Post('memos/:memoId/regenerate')
  async regenerateMemo(@CurrentUser() user: AuthenticatedUser, @Param('memoId') memoId: string) {
    const existing = await this.domain.assertMemoAccess(user, memoId);
    const company = await this.prisma.company.findUniqueOrThrow({ where: { id: existing.companyId }, include: { metrics: true, fundraising: true, claims: true, redFlags: true, documents: true, members: true } });
    const generated = await this.llm.runRequiredJson({
      userId: user.id,
      companyId: existing.companyId,
      task: 'investment_memo_regenerate',
      system: 'You are a VC investment memo analyst. Return only valid JSON. Do not provide investment advice.',
      user: JSON.stringify({
        company,
        previousMemo: existing.content,
        instruction: 'Regenerate and improve this screening memo. Return title and markdown content.'
      }),
      fallback: {}
    });
    const memo = await this.prisma.investmentMemo.findUniqueOrThrow({ where: { id: memoId } });
    return this.prisma.investmentMemo.update({
      where: { id: memoId },
      data: {
        title: String((generated as any).title ?? memo.title),
        content: String((generated as any).content ?? memo.content)
      }
    });
  }

  @Get('memos/:memoId/export')
  async exportMemo(@CurrentUser() user: AuthenticatedUser, @Param('memoId') memoId: string) {
    await this.domain.assertMemoAccess(user, memoId);
    const memo = await this.prisma.investmentMemo.findUniqueOrThrow({ where: { id: memoId } });
    return { filename: `${memo.title}.md`, content: memo.content };
  }
}

