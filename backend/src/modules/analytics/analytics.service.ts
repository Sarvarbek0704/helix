import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../database/entities/user.entity';
import { Appointment, AppointmentStatus } from '../../database/entities/appointment.entity';
import { Bill, BillStatus } from '../../database/entities/bill.entity';
import { LabOrder } from '../../database/entities/lab-order.entity';
import { Prescription } from '../../database/entities/prescription.entity';
import { DoctorProfile } from '../../database/entities/doctor-profile.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Appointment) private apptRepo: Repository<Appointment>,
    @InjectRepository(Bill) private billRepo: Repository<Bill>,
    @InjectRepository(LabOrder) private labRepo: Repository<LabOrder>,
    @InjectRepository(Prescription) private prescRepo: Repository<Prescription>,
    @InjectRepository(DoctorProfile) private doctorRepo: Repository<DoctorProfile>,
  ) {}

  async getAdminDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const [
      totalPatients, totalDoctors, totalNurses,
      totalAppointments, todayAppointments, completedAppointments,
      pendingAppointments, totalBills, paidBills,
      totalLabOrders, totalPrescriptions,
    ] = await Promise.all([
      this.userRepo.count({ where: { role: UserRole.PATIENT } }),
      this.userRepo.count({ where: { role: UserRole.DOCTOR } }),
      this.userRepo.count({ where: { role: UserRole.NURSE } }),
      this.apptRepo.count(),
      this.apptRepo.count({ where: { appointmentDate: today } }),
      this.apptRepo.count({ where: { status: AppointmentStatus.COMPLETED } }),
      this.apptRepo.count({ where: { status: AppointmentStatus.PENDING } }),
      this.billRepo.count(),
      this.billRepo.count({ where: { status: BillStatus.PAID } }),
      this.labRepo.count(),
      this.prescRepo.count(),
    ]);

    const revenueResult = await this.billRepo
      .createQueryBuilder('b')
      .select('SUM(b.paidAmount)', 'total')
      .where('b.status = :status', { status: BillStatus.PAID })
      .getRawOne();

    const topDoctors = await this.doctorRepo.find({ relations: ['user', 'department'], order: { totalAppointments: 'DESC' }, take: 5 });

    return {
      users: { totalPatients, totalDoctors, totalNurses },
      appointments: { total: totalAppointments, today: todayAppointments, completed: completedAppointments, pending: pendingAppointments },
      billing: { total: totalBills, paid: paidBills, revenue: Number(revenueResult?.total || 0) },
      lab: { total: totalLabOrders },
      prescriptions: { total: totalPrescriptions },
      topDoctors,
    };
  }

  async getPatientDashboard(patientId: string) {
    const [totalAppointments, upcomingAppointments, totalPrescriptions, totalLabOrders, unpaidBills] = await Promise.all([
      this.apptRepo.count({ where: { patientId } }),
      this.apptRepo.count({ where: { patientId, status: AppointmentStatus.CONFIRMED } }),
      this.prescRepo.count({ where: { patientId } }),
      this.labRepo.count({ where: { patientId } }),
      this.billRepo.count({ where: { patientId, status: BillStatus.PENDING } }),
    ]);
    return { totalAppointments, upcomingAppointments, totalPrescriptions, totalLabOrders, unpaidBills };
  }

  async getDoctorDashboard(doctorUserId: string) {
    const doctor = await this.doctorRepo.findOne({ where: { userId: doctorUserId } });
    if (!doctor) return {};
    const today = new Date().toISOString().split('T')[0];
    const [totalPatients, todayAppointments, totalAppointments, completedToday] = await Promise.all([
      this.apptRepo.createQueryBuilder('a').select('COUNT(DISTINCT a.patientId)', 'count').where('a.doctorId = :id', { id: doctor.id }).getRawOne(),
      this.apptRepo.count({ where: { doctorId: doctor.id, appointmentDate: today } }),
      this.apptRepo.count({ where: { doctorId: doctor.id } }),
      this.apptRepo.count({ where: { doctorId: doctor.id, appointmentDate: today, status: AppointmentStatus.COMPLETED } }),
    ]);
    return {
      totalPatients: Number(totalPatients?.count || 0),
      todayAppointments, totalAppointments, completedToday,
      rating: doctor.rating, reviewCount: doctor.reviewCount,
    };
  }
}
