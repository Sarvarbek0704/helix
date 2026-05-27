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

    const [totalPatients, totalDoctors, totalNurses, totalAdmins, todayAppointments, pendingAppointments, totalLabOrders, completedAppointments] = await Promise.all([
      this.userRepo.count({ where: { role: UserRole.PATIENT } }),
      this.userRepo.count({ where: { role: UserRole.DOCTOR } }),
      this.userRepo.count({ where: { role: UserRole.NURSE } }),
      this.userRepo.count({ where: { role: UserRole.ADMIN } }),
      this.apptRepo.count({ where: { appointmentDate: today } }),
      this.apptRepo.count({ where: { status: AppointmentStatus.PENDING } }),
      this.labRepo.count(),
      this.apptRepo.count({ where: { status: AppointmentStatus.COMPLETED } }),
    ]);

    const monthlyRevenueResult = await this.billRepo
      .createQueryBuilder('b')
      .select('SUM(b.paidAmount)', 'total')
      .where('b.status = :status', { status: BillStatus.PAID })
      .andWhere('b.paidAt >= :start', { start: thisMonthStart })
      .getRawOne();

    const totalRevenueResult = await this.billRepo
      .createQueryBuilder('b')
      .select('SUM(b.paidAmount)', 'total')
      .where('b.status = :status', { status: BillStatus.PAID })
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
      pendingAppointments,
      totalLabOrders,
      completedAppointments,
      monthlyRevenue: Number(monthlyRevenueResult?.total || 0),
      totalRevenue: Number(totalRevenueResult?.total || 0),
      recentAppointments,
      departmentStats: departmentStats.sort((a, b) => b.appointments - a.appointments),
    };
  }

  async getPatientDashboard(patientId: string) {
    const [totalAppointments, confirmedUpcoming, pendingUpcoming, totalPrescriptions, totalLabOrders, pendingBills, totalRecords] = await Promise.all([
      this.apptRepo.count({ where: { patientId } }),
      this.apptRepo.count({ where: { patientId, status: AppointmentStatus.CONFIRMED } }),
      this.apptRepo.count({ where: { patientId, status: AppointmentStatus.PENDING } }),
      this.prescRepo.count({ where: { patientId } }),
      this.labRepo.count({ where: { patientId } }),
      this.billRepo.count({ where: { patientId, status: BillStatus.PENDING } }),
      this.recordRepo.count({ where: { patientId } }),
    ]);
    return {
      totalAppointments,
      upcomingAppointments: confirmedUpcoming + pendingUpcoming,
      totalPrescriptions,
      totalLabOrders,
      pendingBills,
      totalRecords,
    };
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

    // Recent 5 unique patients
    const recentPatientRows = await this.apptRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.patient', 'patient')
      .where('a.doctorId = :id', { id: doctor.id })
      .orderBy('a.createdAt', 'DESC')
      .getMany();

    const seen = new Set<string>();
    const recentPatients: any[] = [];
    for (const appt of recentPatientRows) {
      if (appt.patient && !seen.has(appt.patient.id)) {
        seen.add(appt.patient.id);
        recentPatients.push(appt.patient);
        if (recentPatients.length >= 5) break;
      }
    }

    return {
      totalPatients: Number(totalPatientsRaw?.count || 0),
      todayAppointments,
      totalAppointments,
      completedToday,
      pendingAppointments,
      rating: doctor.rating,
      reviewCount: doctor.reviewCount,
      recentPatients,
    };
  }

  async getRevenueChart() {
    const months: { month: string; revenue: number; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const res = await this.billRepo
        .createQueryBuilder('b')
        .select('SUM(b.paidAmount)', 'total')
        .addSelect('COUNT(b.id)', 'count')
        .where('b.status = :s', { s: 'paid' })
        .andWhere('b.paidAt BETWEEN :start AND :end', { start, end })
        .getRawOne();
      months.push({
        month: start.toLocaleString('en', { month: 'short' }),
        revenue: Number(res?.total || 0),
        count: Number(res?.count || 0),
      });
    }
    return months;
  }

  async getAppointmentChart() {
    const days: { day: string; total: number; completed: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const [total, completed] = await Promise.all([
        this.apptRepo.count({ where: { appointmentDate: dateStr } }),
        this.apptRepo.count({ where: { appointmentDate: dateStr, status: AppointmentStatus.COMPLETED } }),
      ]);
      days.push({ day: d.toLocaleString('en', { weekday: 'short' }), total, completed });
    }
    return days;
  }

  async getDoctorWorkload() {
    const doctors = await this.doctorRepo.find({ relations: ['user', 'department'] });
    const today = new Date().toISOString().split('T')[0];
    const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    return Promise.all(doctors.map(async (doc) => {
      const [totalAppointments, todayCount, monthCount, pendingCount] = await Promise.all([
        this.apptRepo.count({ where: { doctorId: doc.id } }),
        this.apptRepo.count({ where: { doctorId: doc.id, appointmentDate: today } }),
        this.apptRepo.createQueryBuilder('a').where('a.doctorId = :id', { id: doc.id })
          .andWhere('a.createdAt >= :start', { start: thisMonthStart }).getCount(),
        this.apptRepo.count({ where: { doctorId: doc.id, status: AppointmentStatus.PENDING } }),
      ]);
      return {
        id: doc.id,
        doctor: { firstName: doc.user?.firstName, lastName: doc.user?.lastName, specialization: doc.specialization },
        department: doc.department?.name,
        rating: Number(doc.rating || 0),
        totalAppointments,
        todayCount,
        monthCount,
        pendingCount,
      };
    }));
  }
}
