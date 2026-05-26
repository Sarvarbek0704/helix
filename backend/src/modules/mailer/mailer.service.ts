import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailerService.name);

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get('mail.host'),
      port: config.get('mail.port'),
      secure: config.get('mail.secure'),
      auth: { user: config.get('mail.user'), pass: config.get('mail.pass') },
    });
  }

  private async send(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: `"${this.config.get('mail.fromName')}" <${this.config.get('mail.fromEmail')}>`,
        to, subject, html,
      });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err.message}`);
    }
  }

  async sendOtpEmail(to: string, name: string, otp: string) {
    await this.send(to, 'Verify Your Helix Account', `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#0891b2;margin:0;font-size:28px;">🏥 Helix</h1>
          <p style="color:#64748b;margin:4px 0 0;">Healthcare Management Platform</p>
        </div>
        <h2 style="color:#1e293b;">Hi ${name},</h2>
        <p style="color:#475569;">Your verification code is:</p>
        <div style="background:#0891b2;color:white;font-size:36px;font-weight:bold;text-align:center;padding:20px;border-radius:12px;letter-spacing:8px;margin:20px 0;">${otp}</div>
        <p style="color:#64748b;font-size:14px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
        <p style="color:#94a3b8;font-size:12px;text-align:center;">© 2025 Helix Healthcare. All rights reserved.</p>
      </div>
    `);
  }

  async sendPasswordResetEmail(to: string, name: string, token: string) {
    const resetUrl = `${this.config.get('app.frontendUrl') || process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await this.send(to, 'Reset Your Helix Password', `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#0891b2;margin:0;font-size:28px;">🏥 Helix</h1>
        </div>
        <h2 style="color:#1e293b;">Hi ${name},</h2>
        <p style="color:#475569;">Click below to reset your password. This link expires in 1 hour.</p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${resetUrl}" style="background:#0891b2;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">Reset Password</a>
        </div>
        <p style="color:#94a3b8;font-size:12px;">If you didn't request this, ignore this email.</p>
      </div>
    `);
  }

  async sendAppointmentConfirmation(to: string, name: string, appointmentDetails: { date: string; time: string; doctor: string; type: string }) {
    await this.send(to, 'Appointment Confirmed — Helix', `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#0891b2;margin:0;font-size:28px;">🏥 Helix</h1>
        </div>
        <h2 style="color:#1e293b;">Appointment Confirmed! ✅</h2>
        <p style="color:#475569;">Hi ${name}, your appointment has been confirmed:</p>
        <div style="background:white;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="margin:4px 0;color:#475569;"><strong>Doctor:</strong> ${appointmentDetails.doctor}</p>
          <p style="margin:4px 0;color:#475569;"><strong>Date:</strong> ${appointmentDetails.date}</p>
          <p style="margin:4px 0;color:#475569;"><strong>Time:</strong> ${appointmentDetails.time}</p>
          <p style="margin:4px 0;color:#475569;"><strong>Type:</strong> ${appointmentDetails.type}</p>
        </div>
        <p style="color:#94a3b8;font-size:12px;text-align:center;">© 2025 Helix Healthcare</p>
      </div>
    `);
  }
}
