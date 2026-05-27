import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import mailConfig from './config/mail.config';

import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { DemoGuard } from './common/guards/demo.guard';

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
import { AuditModule } from './modules/audit/audit.module';
import { SearchModule } from './modules/search/search.module';
import { CronJobsModule } from './modules/cron/cron.module';
import { WaitlistModule } from './modules/waitlist/waitlist.module';

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
    ScheduleModule.forRoot(),
    MailerModule,
    AuthModule,
    UsersModule,
    AuditModule,
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
    SearchModule,
    CronJobsModule,
    WaitlistModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: DemoGuard },
  ],
})
export class AppModule {}
