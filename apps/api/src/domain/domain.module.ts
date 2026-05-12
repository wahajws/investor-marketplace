import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AdminController } from './controllers/admin.controller';
import { AiController } from './controllers/ai.controller';
import { CompaniesController } from './controllers/companies.controller';
import { DocumentsController } from './controllers/documents.controller';
import { FounderController } from './controllers/founder.controller';
import { InvestorController } from './controllers/investor.controller';
import { MatchingController } from './controllers/matching.controller';
import { OrganizationsController } from './controllers/organizations.controller';
import { PipelineController } from './controllers/pipeline.controller';
import { RequestsController } from './controllers/requests.controller';
import { NotificationsController } from './controllers/notifications.controller';
import { DocumentTextService } from './document-text.service';
import { DomainService } from './domain.service';
import { LlmService } from './llm.service';

@Module({
  imports: [JwtModule.register({}), UsersModule],
  controllers: [
    AdminController,
    AiController,
    CompaniesController,
    DocumentsController,
    FounderController,
    InvestorController,
    MatchingController,
    OrganizationsController,
    PipelineController,
    RequestsController,
    NotificationsController
  ],
  providers: [DocumentTextService, DomainService, LlmService]
})
export class DomainModule {}
