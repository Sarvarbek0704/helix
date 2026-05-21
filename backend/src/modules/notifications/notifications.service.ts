import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../database/entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private notifRepo: Repository<Notification>) {}

  async getAll(userId: string, query: { page?: number; limit?: number; unreadOnly?: boolean }) {
    const page = query.page || 1; const limit = query.limit || 20; const skip = (page - 1) * limit;
    const where: any = { userId };
    if (query.unreadOnly) where.isRead = false;
    const [data, total] = await this.notifRepo.findAndCount({ where, skip, take: limit, order: { createdAt: 'DESC' } });
    return { data, total, page, limit };
  }

  async getUnreadCount(userId: string) {
    const count = await this.notifRepo.count({ where: { userId, isRead: false } });
    return { count };
  }

  async markRead(id: string, userId: string) {
    await this.notifRepo.update({ id, userId }, { isRead: true });
    return { message: 'Marked as read' };
  }

  async markAllRead(userId: string) {
    await this.notifRepo.update({ userId, isRead: false }, { isRead: true });
    return { message: 'All marked as read' };
  }

  async delete(id: string, userId: string) {
    await this.notifRepo.delete({ id, userId });
    return { message: 'Notification deleted' };
  }
}
