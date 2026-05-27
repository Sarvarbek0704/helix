import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VitalSigns } from '../../database/entities/vital-signs.entity';
import { Notification, NotificationType } from '../../database/entities/notification.entity';
import { CreateVitalsDto } from './dto/vitals.dto';

@Injectable()
export class VitalsService {
  constructor(
    @InjectRepository(VitalSigns) private vitalsRepo: Repository<VitalSigns>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
  ) {}

  async record(recordedById: string, dto: CreateVitalsDto) {
    const bmi = dto.weight && dto.height ? +(dto.weight / ((dto.height / 100) ** 2)).toFixed(1) : null;
    const vital = this.vitalsRepo.create({ ...dto, recordedById, bmi, recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : new Date() });
    const saved = await this.vitalsRepo.save(vital);

    // Check for abnormal vitals and create notification
    const alerts: string[] = [];
    if (dto.systolicBP && dto.systolicBP > 140) alerts.push(`High systolic BP: ${dto.systolicBP} mmHg`);
    if (dto.diastolicBP && dto.diastolicBP > 90) alerts.push(`High diastolic BP: ${dto.diastolicBP} mmHg`);
    if (dto.heartRate && (dto.heartRate > 100 || dto.heartRate < 50)) alerts.push(`Abnormal heart rate: ${dto.heartRate} bpm`);
    if (dto.oxygenSaturation && dto.oxygenSaturation < 94) alerts.push(`Low O₂ saturation: ${dto.oxygenSaturation}%`);
    if (dto.temperature && (dto.temperature > 38.5 || dto.temperature < 35.5)) alerts.push(`Abnormal temperature: ${dto.temperature}°C`);
    if (dto.glucoseLevel && (dto.glucoseLevel > 200 || dto.glucoseLevel < 70)) alerts.push(`Abnormal glucose: ${dto.glucoseLevel} mg/dL`);

    if (alerts.length > 0) {
      await this.notifRepo.save(this.notifRepo.create({
        userId: dto.patientId,
        type: NotificationType.SYSTEM,
        title: '⚠️ Abnormal Vitals Detected',
        message: alerts.join('. ') + '. Please consult your doctor.',
      }));
    }

    return saved;
  }

  async getMyVitals(patientId: string, query: { page?: number; limit?: number }) {
    const page = query.page || 1; const limit = query.limit || 20; const skip = (page - 1) * limit;
    const [data, total] = await this.vitalsRepo.findAndCount({ where: { patientId }, skip, take: limit, order: { recordedAt: 'DESC' } });
    return { data, total, page, limit };
  }

  async getPatientVitals(patientId: string, query: any) {
    return this.getMyVitals(patientId, query);
  }

  async getLatest(patientId: string) {
    return this.vitalsRepo.findOne({ where: { patientId }, order: { recordedAt: 'DESC' } });
  }
}
