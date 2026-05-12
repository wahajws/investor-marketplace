import { Body, Controller, Delete, Get, Param, Patch, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { Response } from 'express';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { DomainService } from '../domain.service';

const uploadDir = join(process.cwd(), 'storage', 'uploads');
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

@UseGuards(JwtAuthGuard)
@Controller()
export class DocumentsController {
  constructor(private readonly prisma: PrismaService, private readonly domain: DomainService) {}

  @Post('companies/:companyId/documents')
  @UseInterceptors(FileInterceptor('file', { storage: diskStorage({ destination: uploadDir, filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`) }) }))
  async upload(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string, @UploadedFile() file: Express.Multer.File, @Body() body: any) {
    await this.domain.assertCompanyAccess(user, companyId, 'write');
    const document = await this.prisma.document.create({
      data: {
        companyId,
        category: body.category ?? 'Other',
        visibility: body.visibility ?? 'PRIVATE',
        description: body.description,
        filename: file?.originalname ?? body.filename ?? 'document.txt',
        mimeType: file?.mimetype ?? body.mimeType,
        sizeBytes: file?.size ?? 0,
        storagePath: file?.path ?? join(uploadDir, body.filename ?? 'document.txt')
      }
    });
    await this.domain.audit(user.id, 'document.upload', 'Document', document.id);
    return document;
  }

  @Get('companies/:companyId/documents')
  async list(@CurrentUser() user: AuthenticatedUser, @Param('companyId') companyId: string) {
    await this.domain.assertCompanyAccess(user, companyId, 'read');
    return this.prisma.document.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' } });
  }

  @Get('documents/:documentId')
  async get(@CurrentUser() user: AuthenticatedUser, @Param('documentId') documentId: string) {
    const document = await this.prisma.document.findUniqueOrThrow({ where: { id: documentId } });
    await this.domain.assertCompanyAccess(user, document.companyId, 'read');
    return document;
  }

  @Get('documents/:documentId/download')
  async download(@CurrentUser() user: AuthenticatedUser, @Param('documentId') documentId: string, @Res() response: Response) {
    const document = await this.get(user, documentId);
    return response.download(document.storagePath, document.filename);
  }

  @Patch('documents/:documentId')
  async update(@CurrentUser() user: AuthenticatedUser, @Param('documentId') documentId: string, @Body() body: any) {
    const document = await this.prisma.document.findUniqueOrThrow({ where: { id: documentId } });
    await this.domain.assertCompanyAccess(user, document.companyId, 'write');
    return this.prisma.document.update({ where: { id: documentId }, data: body });
  }

  @Delete('documents/:documentId')
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('documentId') documentId: string) {
    const document = await this.prisma.document.findUniqueOrThrow({ where: { id: documentId } });
    await this.domain.assertCompanyAccess(user, document.companyId, 'write');
    await this.prisma.document.delete({ where: { id: documentId } });
    return { success: true };
  }

  @Post('documents/:documentId/process')
  async process(@CurrentUser() user: AuthenticatedUser, @Param('documentId') documentId: string) {
    const document = await this.prisma.document.findUniqueOrThrow({ where: { id: documentId } });
    await this.domain.assertCompanyAccess(user, document.companyId, 'write');
    await this.prisma.document.update({ where: { id: documentId }, data: { status: 'EXTRACTED' } });
    return this.prisma.documentExtraction.create({
      data: {
        companyId: document.companyId,
        documentId,
        rawText: `Extraction placeholder for ${document.filename}`,
        resultJson: { filename: document.filename, category: document.category }
      }
    });
  }

  @Get('documents/:documentId/extraction')
  async extraction(@CurrentUser() user: AuthenticatedUser, @Param('documentId') documentId: string) {
    const document = await this.prisma.document.findUniqueOrThrow({ where: { id: documentId } });
    await this.domain.assertCompanyAccess(user, document.companyId, 'read');
    return this.prisma.documentExtraction.findMany({ where: { documentId }, orderBy: { createdAt: 'desc' } });
  }

  @Post('documents/:documentId/access-grants')
  async grant(@CurrentUser() user: AuthenticatedUser, @Param('documentId') documentId: string, @Body() body: any) {
    const document = await this.prisma.document.findUniqueOrThrow({ where: { id: documentId } });
    await this.domain.assertCompanyAccess(user, document.companyId, 'write');
    return this.prisma.documentAccessGrant.create({ data: { documentId, organizationId: body.organizationId } });
  }

  @Delete('documents/:documentId/access-grants/:grantId')
  async revoke(@CurrentUser() user: AuthenticatedUser, @Param('documentId') documentId: string, @Param('grantId') grantId: string) {
    const document = await this.prisma.document.findUniqueOrThrow({ where: { id: documentId } });
    await this.domain.assertCompanyAccess(user, document.companyId, 'write');
    await this.prisma.documentAccessGrant.delete({ where: { id: grantId } });
    return { success: true };
  }
}

