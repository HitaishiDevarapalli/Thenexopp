import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from '../../database/entities/notification.entity';
import { AgentEntity } from '../../database/entities/agent.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
  ) {}

  async getNotifications(userId: string) {
    const agent = await this.agentRepository.findOne({ where: { userId } });
    if (!agent) throw new NotFoundException('Agent not found');

    const notifications = await this.notificationRepository.find({
      where: { agentId: agent.id },
      order: { createdAt: 'DESC' },
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return {
      success: true,
      data: {
        unreadCount,
        notifications,
      },
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const agent = await this.agentRepository.findOne({ where: { userId } });
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, agentId: agent.id },
    });

    if (!notification) throw new NotFoundException('Notification not found');

    notification.isRead = true;
    await this.notificationRepository.save(notification);

    return { success: true, message: 'Notification marked as read' };
  }

  async markAllAsRead(userId: string) {
    const agent = await this.agentRepository.findOne({ where: { userId } });
    await this.notificationRepository.update({ agentId: agent.id }, { isRead: true });
    return { success: true, message: 'All notifications marked as read' };
  }

  async createNotification(agentId: string, title: string, message: string, type: string, data?: Record<string, any>) {
    const notif = this.notificationRepository.create({
      agentId,
      title,
      message,
      type,
      data: data || {},
      isRead: false,
    });
    return this.notificationRepository.save(notif);
  }
}
