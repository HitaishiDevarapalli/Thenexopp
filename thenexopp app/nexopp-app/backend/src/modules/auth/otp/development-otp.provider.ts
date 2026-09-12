import { Injectable, Logger } from '@nestjs/common';
import { IOtpProvider } from './otp.interface';

@Injectable()
export class DevelopmentOtpProvider implements IOtpProvider {
  private readonly logger = new Logger(DevelopmentOtpProvider.name);

  async sendOtp(mobileNumber: string, otp: string): Promise<boolean> {
    this.logger.log(`[DEV OTP PROVIDER] Mobile: ${mobileNumber} | OTP Code: ${otp} (Never logged in prod)`);
    return true;
  }
}
