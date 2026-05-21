import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import mailConfig from './config/mail.config';

import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

import { MailerModule } from './modules/mailer/mailer.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PatientsModule } from './modules/patients/patients.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { MedicalModule } from './modules/medical/medical.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { LabModule } from './modules/lab/lab.module';
import { MedicationsModule } from './modules/medications/medications.module';
import { VitalsModule } from './modules/vitals/vitals.module';
import { BillingModule } from './modules/billing/billing.module';
import { InsuranceModule } from './modules/insurance/insurance.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, mailConfig],
      envFilePath: ['.env', '.env.local'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('database'),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [{
          ttl: parseInt(config.get('THROTTLE_TTL') || '60') * 1000,
          limit: parseInt(config.get('THROTTLE_LIMIT') || '100'),
        }],
      }),
    }),
    MailerModule,
    AuthModule,
    UsersModule,
    PatientsModule,
    DoctorsModule,
    DepartmentsModule,
    SchedulesModule,
    AppointmentsModule,
    MedicalModule,
    PrescriptionsModule,
    LabModule,
    MedicationsModule,
    VitalsModule,
    BillingModule,
    InsuranceModule,
    NotificationsModule,
    AnalyticsModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
