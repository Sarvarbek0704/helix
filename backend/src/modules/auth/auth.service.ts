import { Injectable, ConflictException, UnauthorizedException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus, UserRole } from '../../database/entities/user.entity';
import { PatientProfile } from '../../database/entities/patient-profile.entity';
import { DoctorProfile } from '../../database/entities/doctor-profile.entity';
import { RegisterDto, LoginDto, VerifyOtpDto, ResendOtpDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto, RefreshTokenDto } from './dto/auth.dto';
import { MailerService } from '../mailer/mailer.service';
import { generateOtp, generateToken } from '../../common/utils/generate.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(PatientProfile) private patientRepo: Repository<PatientProfile>,
    @InjectRepository(DoctorProfile) private doctorRepo: Repository<DoctorProfile>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailerService: MailerService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 12);
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = this.userRepo.create({
      ...dto,
      password: hashed,
      role: dto.role || UserRole.PATIENT,
      status: UserStatus.PENDING,
      otpCode: otp,
      otpExpires,
    });
    await this.userRepo.save(user);
    await this.mailerService.sendOtpEmail(user.email, user.firstName, otp);
    return { message: 'Registration successful. Please verify your email.', email: dto.email, requiresVerification: true };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'status', 'otpCode', 'otpExpires'],
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.status === UserStatus.ACTIVE) throw new BadRequestException('Already verified');
    if (!user.otpCode || !user.otpExpires) throw new BadRequestException('No OTP requested');
    if (new Date() > user.otpExpires) throw new BadRequestException('OTP expired. Request a new one.');
    if (user.otpCode !== dto.otp) throw new UnauthorizedException('Invalid OTP');

    await this.userRepo.update(user.id, { status: UserStatus.ACTIVE, isEmailVerified: true, otpCode: null, otpExpires: null });

    if (user.role === UserRole.PATIENT) {
      const result = await this.patientRepo
        .createQueryBuilder('p')
        .select("MAX(CAST(SUBSTRING(p.patientNumber, 2) AS INTEGER))", 'maxNum')
        .getRawOne();
      const nextNum = (result?.maxNum ?? 0) + 1;
      await this.patientRepo.save(
        this.patientRepo.create({ userId: user.id, patientNumber: `P${String(nextNum).padStart(6, '0')}` }),
      );
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    const fullUser = await this.userRepo.findOne({ where: { id: user.id } });
    return { user: fullUser, ...tokens };
  }

  async resendOtp(dto: ResendOtpDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email }, select: ['id', 'email', 'firstName', 'status', 'otpExpires'] });
    if (!user) throw new NotFoundException('User not found');
    if (user.status === UserStatus.ACTIVE) throw new BadRequestException('Already verified');

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await this.userRepo.update(user.id, { otpCode: otp, otpExpires });
    await this.mailerService.sendOtpEmail(user.email, user.firstName, otp);
    return { message: 'Verification code resent' };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'status', 'password', 'avatar', 'isEmailVerified', 'phone'],
    });
    if (!user || !user.password) throw new UnauthorizedException('Invalid credentials');
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
    if (user.status === UserStatus.PENDING) throw new ForbiddenException({ message: 'Email not verified', requiresVerification: true, email: dto.email });
    if (user.status === UserStatus.SUSPENDED) throw new UnauthorizedException('Account suspended. Contact support.');

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    const fullUser = await this.userRepo.findOne({ where: { id: user.id } });
    return { user: fullUser, ...tokens };
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return user;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (user) {
      const token = generateToken();
      await this.userRepo.update(user.id, { resetToken: token, resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000) });
      await this.mailerService.sendPasswordResetEmail(user.email, user.firstName, token);
    }
    return { message: 'If that email is registered, you will receive a reset link.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userRepo.findOne({ where: { resetToken: dto.token }, select: ['id', 'resetToken', 'resetTokenExpires'] });
    if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) throw new BadRequestException('Invalid or expired reset token');
    const hashed = await bcrypt.hash(dto.password, 12);
    await this.userRepo.update(user.id, { password: hashed, resetToken: null, resetTokenExpires: null });
    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepo.findOne({ where: { id: userId }, select: ['id', 'password'] });
    if (!user?.password) throw new BadRequestException('No password set');
    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('Current password incorrect');
    const hashed = await bcrypt.hash(dto.newPassword, 12);
    await this.userRepo.update(userId, { password: hashed });
    return { message: 'Password changed successfully' };
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, { secret: this.configService.get<string>('jwt.refreshSecret') });
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException();
      return this.generateTokens(user.id, user.email, user.role);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { secret: this.configService.get<string>('jwt.secret'), expiresIn: this.configService.get('jwt.expiresIn') as any }),
      this.jwtService.signAsync(payload, { secret: this.configService.get<string>('jwt.refreshSecret'), expiresIn: this.configService.get('jwt.refreshExpiresIn') as any }),
    ]);
    return { accessToken, refreshToken };
  }
}
