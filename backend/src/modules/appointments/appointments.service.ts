import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Appointment, AppointmentStatus, AppointmentType } from '../../database/entities/appointment.entity';
import { DoctorProfile } from '../../database/entities/doctor-profile.entity';
import { User } from '../../database/entities/user.entity';
import { Notification, NotificationType } from '../../database/entities/notification.entity';
import { CreateAppointmentDto, UpdateAppointmentDto, DoctorUpdateDto, CancelDto } from './dto/appointment.dto';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment) private apptRepo: Repository<Appointment>,
    @InjectRepository(DoctorProfile) private doctorRepo: Repository<DoctorProfile>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    private mailerService: MailerService,
  ) {}

  private generateAppointmentNumber(): string {
    return `APT-${Date.now().toString(36).toUpperCase()}`;
  }

  async create(patientId: string, dto: CreateAppointmentDto) {
    const doctor = await this.doctorRepo.findOne({ where: { id: dto.doctorId }, relations: ['user'] });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const conflict = await this.apptRepo.findOne({
      where: {
        doctorId: dto.doctorId,
        appointmentDate: dto.appointmentDate,
        appointmentTime: dto.appointmentTime,
        status: In([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS]),
      },
    });
    if (conflict) throw new BadRequestException('This time slot is already booked');

    const appointment = this.apptRepo.create({
      patientId,
      doctorId: dto.doctorId,
      departmentId: doctor.departmentId,
      appointmentDate: dto.appointmentDate,
      appointmentTime: dto.appointmentTime,
      type: dto.type || AppointmentType.IN_PERSON,
      reason: dto.reason,
      symptoms: dto.symptoms,
      durationMinutes: dto.durationMinutes || 30,
      fee: dto.type === AppointmentType.FOLLOW_UP ? doctor.followUpFee : doctor.consultationFee,
      status: AppointmentStatus.PENDING,
      appointmentNumber: this.generateAppointmentNumber(),
    });
    const saved = await this.apptRepo.save(appointment);

    await this.notifRepo.save(this.notifRepo.create({
      userId: doctor.userId,
      type: NotificationType.APPOINTMENT_CONFIRMED,
      title: 'New Appointment Request',
      message: `A patient has requested an appointment on ${dto.appointmentDate} at ${dto.appointmentTime}`,
    }));

    return this.findOne(saved.id);
  }

  async findAll(query: { page?: number; limit?: number; status?: string; date?: string; patientId?: string; doctorId?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.apptRepo.createQueryBuilder('a')
      .leftJoinAndSelect('a.patient', 'patient')
      .leftJoinAndSelect('a.doctor', 'doctor')
      .leftJoinAndSelect('doctor.user', 'doctorUser')
      .leftJoinAndSelect('a.department', 'department')
      .skip(skip).take(limit)
      .orderBy('a.appointmentDate', 'DESC')
      .addOrderBy('a.appointmentTime', 'ASC');

    if (query.status) qb.andWhere('a.status = :status', { status: query.status });
    if (query.date) qb.andWhere('a.appointmentDate = :date', { date: query.date });
    if (query.patientId) qb.andWhere('a.patientId = :pid', { pid: query.patientId });
    if (query.doctorId) qb.andWhere('a.doctorId = :did', { did: query.doctorId });

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const appt = await this.apptRepo.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'doctor.user', 'department'],
    });
    if (!appt) throw new NotFoundException('Appointment not found');
    return appt;
  }

  async getMyAppointments(patientId: string, query: any) {
    return this.findAll({ ...query, patientId });
  }

  async getDoctorAppointments(userId: string, query: any) {
    const doctor = await this.doctorRepo.findOne({ where: { userId } });
    if (!doctor) return { data: [], total: 0 };
    return this.findAll({ ...query, doctorId: doctor.id });
  }

  async confirm(id: string, doctorUserId: string) {
    const appt = await this.findOne(id);
    const doctor = await this.doctorRepo.findOne({ where: { userId: doctorUserId }, relations: ['user'] });
    if (!doctor || appt.doctorId !== doctor.id) throw new ForbiddenException();
    await this.apptRepo.update(id, { status: AppointmentStatus.CONFIRMED });
    const patient = await this.userRepo.findOne({ where: { id: appt.patientId } });
    await this.notifRepo.save(this.notifRepo.create({
      userId: appt.patientId,
      type: NotificationType.APPOINTMENT_CONFIRMED,
      title: 'Appointment Confirmed',
      message: `Your appointment on ${appt.appointmentDate} at ${appt.appointmentTime} has been confirmed.`,
    }));
    if (patient) {
      const doctorName = doctor.user ? `Dr. ${doctor.user.firstName} ${doctor.user.lastName}` : 'your doctor';
      this.mailerService.sendAppointmentConfirmation(patient.email, patient.firstName, {
        date: String(appt.appointmentDate),
        time: String(appt.appointmentTime),
        doctor: doctorName,
        type: appt.type,
      }).catch(() => {});
    }
    return this.findOne(id);
  }

  async start(id: string, doctorUserId: string) {
    const appt = await this.findOne(id);
    const doctor = await this.doctorRepo.findOne({ where: { userId: doctorUserId } });
    if (!doctor || appt.doctorId !== doctor.id) throw new ForbiddenException();
    await this.apptRepo.update(id, { status: AppointmentStatus.IN_PROGRESS });
    return this.findOne(id);
  }

  async complete(id: string, doctorUserId: string, dto: DoctorUpdateDto) {
    const appt = await this.findOne(id);
    const doctor = await this.doctorRepo.findOne({ where: { userId: doctorUserId } });
    if (!doctor || appt.doctorId !== doctor.id) throw new ForbiddenException();
    await this.apptRepo.update(id, { status: AppointmentStatus.COMPLETED, ...dto });
    await this.doctorRepo.increment({ id: doctor.id }, 'totalAppointments', 1);
    return this.findOne(id);
  }

  async cancel(id: string, userId: string, userRole: string, dto: CancelDto) {
    const appt = await this.findOne(id);
    const isPatient = appt.patientId === userId;
    const doctor = userRole === 'doctor' ? await this.doctorRepo.findOne({ where: { userId } }) : null;
    const isDoctor = doctor && appt.doctorId === doctor.id;
    const isAdmin = userRole === 'admin';
    if (!isPatient && !isDoctor && !isAdmin) throw new ForbiddenException();
    if ([AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED].includes(appt.status)) throw new BadRequestException('Cannot cancel this appointment');
    await this.apptRepo.update(id, { status: AppointmentStatus.CANCELLED, cancelReason: dto.reason });
    return this.findOne(id);
  }

  async getTodayStats(doctorUserId: string) {
    const doctor = await this.doctorRepo.findOne({ where: { userId: doctorUserId } });
    if (!doctor) return { total: 0, pending: 0, confirmed: 0, completed: 0 };
    const today = new Date().toISOString().split('T')[0];
    const [total, pending, confirmed, completed] = await Promise.all([
      this.apptRepo.count({ where: { doctorId: doctor.id, appointmentDate: today } }),
      this.apptRepo.count({ where: { doctorId: doctor.id, appointmentDate: today, status: AppointmentStatus.PENDING } }),
      this.apptRepo.count({ where: { doctorId: doctor.id, appointmentDate: today, status: AppointmentStatus.CONFIRMED } }),
      this.apptRepo.count({ where: { doctorId: doctor.id, appointmentDate: today, status: AppointmentStatus.COMPLETED } }),
    ]);
    return { today, total, pending, confirmed, completed };
  }
}
