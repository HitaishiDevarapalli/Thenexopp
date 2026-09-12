export interface IOtpProvider {
  sendOtp(mobileNumber: string, otp: string): Promise<boolean>;
  verifyOtpExternal?(mobileNumber: string, otp: string): Promise<boolean>;
}
