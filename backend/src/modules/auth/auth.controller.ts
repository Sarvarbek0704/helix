import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, VerifyOtpDto, ResendOtpDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Public() @Post('register') register(@Body() dto: RegisterDto) { return this.authService.register(dto); }
  @Public() @Post('verify-otp') verifyOtp(@Body() dto: VerifyOtpDto) { return this.authService.verifyOtp(dto); }
  @Public() @Post('resend-otp') resendOtp(@Body() dto: ResendOtpDto) { return this.authService.resendOtp(dto); }
  @Public() @Post('login') login(@Body() dto: LoginDto) { return this.authService.login(dto); }
  @Public() @Post('refresh') refresh(@Body() dto: RefreshTokenDto) { return this.authService.refresh(dto); }
  @Public() @Post('forgot-password') forgotPassword(@Body() dto: ForgotPasswordDto) { return this.authService.forgotPassword(dto); }
  @Public() @Post('reset-password') resetPassword(@Body() dto: ResetPasswordDto) { return this.authService.resetPassword(dto); }
  @UseGuards(JwtAuthGuard) @Get('me') getMe(@CurrentUser() user: any) { return this.authService.getMe(user.id); }
  @UseGuards(JwtAuthGuard) @Post('change-password') changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) { return this.authService.changePassword(user.id, dto); }
}
