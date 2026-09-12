import { Injectable, Logger } from '@nestjs/common';
import { IOtpProvider } from './otp.interface';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class Msg91OtpProvider implements IOtpProvider {
  private readonly logger = new Logger(Msg91OtpProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async sendOtp(mobileNumber: string, otp: string): Promise<boolean> {
    const authKey = this.configService.get<string>('MSG91_AUTH_KEY') || this.configService.get<string>('OTP_API_KEY');
    const templateId = this.configService.get<string>('MSG91_TEMPLATE_ID');
    const senderId = this.configService.get<string>('OTP_SENDER_ID', 'THNXOP');

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    const formattedMobile = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;

    if (!authKey || !templateId) {
      this.logger.warn(`MSG91 AuthKey or TemplateID missing in environment variables. Falling back to log simulation for ${formattedMobile.slice(-4)}`);
      return true;
    }

    try {
      this.logger.log(`Dispatching MSG91 OTP to ${formattedMobile.slice(-4)} using Template ID ${templateId}`);

      // Official MSG91 Send OTP API v5
      const url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${formattedMobile}&otp=${otp}`;
      const response = await axios.post(
        url,
        {},
        {
          headers: {
            authkey: authKey,
            'Content-Type': 'application/json',
          },
          timeout: 4000,
        },
      );

      this.logger.log(`MSG91 Response [${response.status}]: ${JSON.stringify(response.data)}`);

      if (response.data && (response.data.type === 'success' || response.status === 200)) {
        return true;
      } else {
        this.logger.error(`MSG91 API error response: ${JSON.stringify(response.data)}`);
        return false;
      }
    } catch (err) {
      this.logger.error(`Failed to send MSG91 OTP: ${err.message}`);
      return false;
    }
  }
}
