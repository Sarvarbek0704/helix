import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Bill, BillStatus } from '../../database/entities/bill.entity';
import { Prescription, PrescriptionStatus } from '../../database/entities/prescription.entity';
import { Appointment, AppointmentStatus } from '../../database/entities/appointment.entity';
import { Notification, NotificationType } from '../../database/entities/notification.entity';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    @InjectRepository(Bill) private billRepo: Repository<Bill>,
    @InjectRepository(Prescription) private prescRepo: Repository<Prescription>,
    @InjectRepository(Appointment) private apptRepo: Repository<Appointment>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
  ) {}

  // Run every day at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async markOverdueBills() {
    const today = new Date();
    const result = await this.billRepo
      .createQueryBuilder()
      .update(Bill)
      .set({ status: BillStatus.OVERDUE })
      .where('dueDate < :today', { today })
      .andWhere('status IN (:...statuses)', { statuses: [BillStatus.PENDING, BillStatus.PARTIAL] })
      .execute();
    if (result.affected > 0) this.logger.log(`Marked ${result.affected} bills as overdue`);
  }

  // Run every day at 1 AM
  @Cron('0 1 * * *')
  async markExpiredPrescriptions() {
    const today = new Date().toISOString().split('T')[0];
    const expired = await this.prescRepo
      .createQueryBuilder()
      .update(Prescription)
      .set({ status: PrescriptionStatus.EXPIRED })
      .where('validUntil < :today', { today })
      .andWhere('status = :s', { s: PrescriptionStatus.ACTIVE })
      .execute();
    if (expired.affected > 0) this.logger.log(`Expired ${expired.affected} prescriptions`);
  }

  // Run every day at 8 AM — send appointment reminders
  @Cron('0 8 * * *')
  async sendAppointmentReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const appointments = await this.apptRepo.find({
      where: {
        appointmentDate: tomorrowStr,
        status: In([AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING]),
      },
      relations: ['doctor', 'doctor.user'],
    });

    for (const appt of appointments) {
      const doctorName = appt.doctor?.user
        ? `Dr. ${appt.doctor.user.firstName} ${appt.doctor.user.lastName}`
        : 'your doctor';
      await this.notifRepo.save(this.notifRepo.create({
        userId: appt.patientId,
        type: NotificationType.APPOINTMENT_REMINDER,
        title: 'Appointment Reminder',
        message: `Reminder: You have an appointment with ${doctorName} tomorrow at ${appt.appointmentTime}.`,
      }));
    }
    if (appointments.length > 0) this.logger.log(`Sent ${appointments.length} appointment reminders`);
  }
}
