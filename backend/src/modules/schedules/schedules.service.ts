import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorSchedule } from '../../database/entities/doctor-schedule.entity';
import { DoctorProfile } from '../../database/entities/doctor-profile.entity';
import { Appointment } from '../../database/entities/appointment.entity';
import { CreateScheduleDto, UpdateScheduleDto } from './dto/schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(DoctorSchedule) private scheduleRepo: Repository<DoctorSchedule>,
    @InjectRepository(DoctorProfile) private doctorRepo: Repository<DoctorProfile>,
    @InjectRepository(Appointment) private appointmentRepo: Repository<Appointment>,
  ) {}

  async getMySchedules(userId: string) {
    const doctor = await this.doctorRepo.findOne({ where: { userId } });
    if (!doctor) return [];
    return this.scheduleRepo.find({ where: { doctorId: doctor.id }, order: { dayOfWeek: 'ASC' } });
  }

  async createSchedule(userId: string, dto: CreateScheduleDto) {
    const doctor = await this.doctorRepo.findOne({ where: { userId } });
    if (!doctor) throw new NotFoundException('Doctor profile not found');
    const schedule = this.scheduleRepo.create({ doctorId: doctor.id, ...dto });
    return this.scheduleRepo.save(schedule);
  }

  async updateSchedule(userId: string, scheduleId: string, dto: UpdateScheduleDto) {
    const doctor = await this.doctorRepo.findOne({ where: { userId } });
    if (!doctor) throw new NotFoundException('Doctor profile not found');
    const schedule = await this.scheduleRepo.findOne({ where: { id: scheduleId, doctorId: doctor.id } });
    if (!schedule) throw new NotFoundException('Schedule not found');
    Object.assign(schedule, dto);
    return this.scheduleRepo.save(schedule);
  }

  async deleteSchedule(userId: string, scheduleId: string) {
    const doctor = await this.doctorRepo.findOne({ where: { userId } });
    if (!doctor) throw new NotFoundException('Doctor profile not found');
    await this.scheduleRepo.delete({ id: scheduleId, doctorId: doctor.id });
    return { message: 'Schedule deleted' };
  }

  async getAvailableSlots(doctorProfileId: string, date: string) {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const d = new Date(date);
    const dayOfWeek = dayNames[d.getDay()];

    const schedule = await this.scheduleRepo.findOne({ where: { doctorId: doctorProfileId, dayOfWeek: dayOfWeek as any, isActive: true } });
    if (!schedule) return { date, slots: [] };

    const bookedAppointments = await this.appointmentRepo.find({
      where: [
        { doctorId: doctorProfileId, appointmentDate: date, status: 'pending' as any },
        { doctorId: doctorProfileId, appointmentDate: date, status: 'confirmed' as any },
        { doctorId: doctorProfileId, appointmentDate: date, status: 'in_progress' as any },
      ],
      select: ['appointmentTime'],
    });
    const bookedTimes = new Set(bookedAppointments.map((a) => a.appointmentTime));

    const slots: { time: string; available: boolean }[] = [];
    const [startH, startM] = schedule.startTime.split(':').map(Number);
    const [endH, endM] = schedule.endTime.split(':').map(Number);
    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current + schedule.slotDurationMinutes <= end) {
      const h = Math.floor(current / 60).toString().padStart(2, '0');
      const m = (current % 60).toString().padStart(2, '0');
      const time = `${h}:${m}`;
      slots.push({ time, available: !bookedTimes.has(time) });
      current += schedule.slotDurationMinutes;
    }
    return { date, dayOfWeek, slots };
  }

  async getDoctorSchedules(doctorProfileId: string) {
    return this.scheduleRepo.find({ where: { doctorId: doctorProfileId, isActive: true }, order: { dayOfWeek: 'ASC' } });
  }
}
