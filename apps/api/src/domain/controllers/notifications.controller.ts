import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
  }

  @Patch(':notificationId/read')
  read(@CurrentUser() user: AuthenticatedUser, @Param('notificationId') notificationId: string) {
    return this.prisma.notification.update({ where: { id: notificationId, userId: user.id }, data: { readAt: new Date() } });
  }

  @Patch('read-all')
  async readAll(@CurrentUser() user: AuthenticatedUser) {
    await this.prisma.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
    return { success: true };
  }
}

