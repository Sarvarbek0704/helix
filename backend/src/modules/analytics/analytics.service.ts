import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../database/entities/user.entity';
import { Appointment, AppointmentStatus } from '../../database/entities/appointment.entity';
import { Bill, BillStatus } from '../../database/entities/bill.entity';
import { LabOrder } from '../../database/entities/lab-order.entity';
import { Prescription } from '../../database/entities/prescription.entity';
import { DoctorProfile } from '../../database/entities/doctor-profile.entity';
import { MedicalRecord } from '../../database/entities/medical-record.entity';
import { Department } from '../../database/entities/department.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Appointment) private apptRepo: Repository<Appointment>,
    @InjectRepository(Bill) private billRepo: Repository<Bill>,
    @InjectRepository(LabOrder) private labRepo: Repository<LabOrder>,
    @InjectRepository(Prescription) private prescRepo: Repository<Prescription>,
    @InjectRepository(DoctorProfile) private doctorRepo: Repository<DoctorProfile>,
    @InjectRepository(MedicalRecord) private recordRepo: Repository<MedicalRecord>,
    @InjectRepository(Department) private deptRepo: Repository<Department>,
  ) {}

  async getAdminDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const [totalPatients, totalDoctors, totalNurses, totalAdmins, todayAppointments] = await Promise.all([
      this.userRepo.count({ where: { role: UserRole.PATIENT } }),
      this.userRepo.count({ where: { role: UserRole.DOCTOR } }),
      this.userRepo.count({ where: { role: UserRole.NURSE } }),
      this.userRepo.count({ where: { role: UserRole.ADMIN } }),
      this.apptRepo.count({ where: { appointmentDate: today } }),
    ]);

    const monthlyRevenueResult = await this.billRepo
      .createQueryBuilder('b')
      .select('SUM(b.paidAmount)', 'total')
      .where('b.status = :status', { status: BillStatus.PAID })
      .andWhere('b.paidAt >= :start', { start: thisMonthStart })
      .getRawOne();

    const recentAppointments = await this.apptRepo.find({
      relations: ['patient', 'doctor', 'doctor.user'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const departments = await this.deptRepo.find({ where: { isActive: true } });
    const departmentStats = await Promise.all(
      departments.map(async (d) => ({
        name: d.name,
        appointments: await this.apptRepo.count({ where: { departmentId: d.id } }),
      })),
    );

    return {
      totalPatients,
      totalDoctors,
      totalNurses,
      totalAdmins,
      todayAppointments,
      monthlyRevenue: Number(monthlyRevenueResult?.total || 0),
      recentAppointments,
      departmentStats: departmentStats.sort((a, b) => b.appointments - a.appointments),
    };
  }

  async getPatientDashboard(patientId: string) {
    const [totalAppointments, upcomingAppointments, totalPrescriptions, totalLabOrders, pendingBills, totalRecords] = await Promise.all([
      this.apptRepo.count({ where: { patientId } }),
      this.apptRepo.count({ where: { patientId, status: AppointmentStatus.CONFIRMED } }),
      this.prescRepo.count({ where: { patientId } }),
      this.labRepo.count({ where: { patientId } }),
      this.billRepo.count({ where: { patientId, status: BillStatus.PENDING } }),
      this.recordRepo.count({ where: { patientId } }),
    ]);
    return { totalAppointments, upcomingAppointments, totalPrescriptions, totalLabOrders, pendingBills, totalRecords };
  }

  async getDoctorDashboard(doctorUserId: string) {
    const doctor = await this.doctorRepo.findOne({ where: { userId: doctorUserId } });
    if (!doctor) return {};
    const today = new Date().toISOString().split('T')[0];
    const [totalPatientsRaw, todayAppointments, totalAppointments, completedToday, pendingAppointments] = await Promise.all([
      this.apptRepo
        .createQueryBuilder('a')
        .select('COUNT(DISTINCT a.patientId)', 'count')
        .where('a.doctorId = :id', { id: doctor.id })
        .getRawOne(),
      this.apptRepo.count({ where: { doctorId: doctor.id, appointmentDate: today } }),
      this.apptRepo.count({ where: { doctorId: doctor.id } }),
      this.apptRepo.count({ where: { doctorId: doctor.id, appointmentDate: today, status: AppointmentStatus.COMPLETED } }),
      this.apptRepo.count({ where: { doctorId: doctor.id, status: AppointmentStatus.PENDING } }),
    ]);
    return {
      totalPatients: Number(totalPatientsRaw?.count || 0),
      todayAppointments,
      totalAppointments,
      completedToday,
      pendingAppointments,
      rating: doctor.rating,
      reviewCount: doctor.reviewCount,
    };
  }
}
