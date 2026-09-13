import { Injectable, BadRequestException, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IOtpProvider } from './otp.interface';
import { DevelopmentOtpProvider } from './development-otp.provider';
import { Msg91OtpProvider } from './msg91-otp.provider';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly provider: IOtpProvider;
  private readonly memoryStore = new Map<string, { otp: string; expiresAt: number; attempts: number; resendCooldown: number }>();

  constructor(
    private readonly configService: ConfigService,
    devProvider: DevelopmentOtpProvider,
    msg91Provider: Msg91OtpProvider,
  ) {
    const providerType = this.configService.get<string>('OTP_PROVIDER', 'MSG91');
    if (providerType === 'MSG91') {
      this.provider = msg91Provider;
    } else {
      this.provider = devProvider;
    }
  }

  private normalizeMobile(mobileNumber: string): string {
    let clean = mobileNumber.replace(/\D/g, '');
    if (clean.length === 12 && clean.startsWith('91')) {
      clean = clean.substring(2);
    }
    return clean;
  }

  async sendOtp(mobileNumber: string): Promise<{ success: boolean; message: string; cooldownSeconds: number }> {
    const cleanMobile = this.normalizeMobile(mobileNumber);
    if (cleanMobile.length !== 10) {
      throw new BadRequestException('Invalid mobile number format');
    }

    const existing = this.memoryStore.get(cleanMobile);
    const now = Date.now();

    if (existing && existing.resendCooldown > now) {
      const waitSeconds = Math.ceil((existing.resendCooldown - now) / 1000);
      return {
        success: true,
        message: `OTP already sent. Please enter the code.`,
        cooldownSeconds: waitSeconds,
      };
    }

    // Always generate secure real 6-digit random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.logger.log(`🔑 [OTP DISPATCH] Mobile: ${cleanMobile} | Generated Code: [${otp}] | Test Bypass: [123456]`);

    const expirySeconds = Number(this.configService.get('OTP_EXPIRY_SECONDS', 300));
    const cooldownSeconds = Number(this.configService.get('OTP_RESEND_COOLDOWN_SECONDS', 60));

    this.memoryStore.set(cleanMobile, {
      otp,
      expiresAt: now + expirySeconds * 1000,
      attempts: 0,
      resendCooldown: now + cooldownSeconds * 1000,
    });

    try {
      const dispatched = await this.provider.sendOtp(cleanMobile, otp);
      if (!dispatched) {
        this.logger.warn(`MSG91 SMS dispatch was not delivered for ${cleanMobile.slice(-4)}. You can enter either OTP [${otp}] or test code [123456]`);
      }
    } catch (err: any) {
      this.logger.error(`Error attempting to dispatch SMS: ${err?.message}. OTP stored: ${otp}`);
    }

    return {
      success: true,
      message: 'OTP sent successfully. (You can also use demo code 123456)',
      cooldownSeconds,
    };
  }

  async verifyOtp(mobileNumber: string, otpInput: string): Promise<boolean> {
    const cleanMobile = this.normalizeMobile(mobileNumber);
    const trimmedOtp = otpInput.trim();

    // Universal Test/Demo OTP bypass (123456)
    if (trimmedOtp === '123456') {
      this.logger.log(`✅ Universal Test OTP 123456 accepted for ${cleanMobile}`);
      this.memoryStore.delete(cleanMobile);
      return true;
    }

    const record = this.memoryStore.get(cleanMobile);
    const now = Date.now();

    if (!record) {
      throw new BadRequestException('No OTP request found for this mobile number or OTP has expired. Please tap resend or enter 123456.');
    }

    if (record.expiresAt < now) {
      this.memoryStore.delete(cleanMobile);
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    if (record.attempts >= 5) {
      this.memoryStore.delete(cleanMobile);
      throw new BadRequestException('Maximum verification attempts exceeded. Please request a new OTP.');
    }

    record.attempts += 1;

    if (record.otp !== trimmedOtp) {
      throw new BadRequestException('Invalid OTP code entered. (You can also use test code 123456)');
    }

    // Verification successful - consume OTP
    this.memoryStore.delete(cleanMobile);
    return true;
  }
}
