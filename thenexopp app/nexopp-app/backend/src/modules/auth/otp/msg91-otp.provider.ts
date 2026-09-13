import { Injectable, Logger } from '@nestjs/common';
import { IOtpProvider } from './otp.interface';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class Msg91OtpProvider implements IOtpProvider {
  private readonly logger = new Logger(Msg91OtpProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async sendOtp(mobileNumber: string, otp: string): Promise<boolean> {
    const authKey =
      this.configService.get<string>('MSG91_AUTH_KEY') ||
      this.configService.get<string>('MSG91_TOKEN_AUTH') ||
      this.configService.get<string>('OTP_API_KEY') ||
      '557093Aca5G41bF6a7d8d93P1';
    const templateId =
      this.configService.get<string>('MSG91_TEMPLATE_ID') ||
      '6a95648afdf721447f020ac2';
    const senderId =
      this.configService.get<string>('OTP_SENDER_ID') ||
      'THNXPP';

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    const formattedMobile = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;

    try {
      this.logger.log(`Dispatching MSG91 OTP to ${formattedMobile.slice(-4)} using Template ID ${templateId}`);

      // Official MSG91 Send OTP API v5
      const url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${formattedMobile}&otp=${otp}&authkey=${authKey}&sender=${senderId}&otp_length=6&otp_expiry=5`;
      const response = await axios.post(
        url,
        {},
        {
          headers: {
            authkey: authKey,
            'Content-Type': 'application/json',
          },
          timeout: 8000,
        },
      );

      this.logger.log(`MSG91 Response [${response.status}]: ${JSON.stringify(response.data)}`);

      if (response.data && (response.data.type === 'success' || response.status === 200)) {
        return true;
      } else {
        this.logger.error(`MSG91 API error response: ${JSON.stringify(response.data)}`);
        return false;
      }
    } catch (err: any) {
      this.logger.error(`Failed to send MSG91 OTP: ${err?.message}`);
      return false;
    }
  }
}

