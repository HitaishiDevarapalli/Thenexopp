import axios from 'axios';

/**
 * Validate standard email format
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim().toLowerCase());
};

/**
 * Send 6-Digit OTP code to user's email address via MSG91 Email API
 * Falls back to Dev Simulation mode if MSG91 credentials are not configured.
 */
export const sendEmailOtpViaMsg91 = async (email, otp) => {
  const cleanEmail = email.trim().toLowerCase();
  const authKey = process.env.MSG91_AUTH_KEY || process.env.MSG91_TOKEN_AUTH;
  const templateId = process.env.MSG91_EMAIL_TEMPLATE_ID;
  const senderEmail = process.env.MSG91_SENDER_EMAIL || 'no-reply@thenexopp.com';

  const isLiveConfig = authKey && 
    authKey !== 'YOUR_MSG91_AUTH_KEY' && 
    authKey !== 'YOUR_MSG91_TOKEN_AUTH' && 
    authKey !== 'your_msg91_token_auth';

  if (isLiveConfig && templateId) {
    try {
      const url = 'https://control.msg91.com/api/v5/email/send';
      const payload = {
        to: [{ email: cleanEmail }],
        from: {
          email: senderEmail,
          name: 'TheNexOpp',
        },
        template_id: templateId,
        variables: {
          OTP: otp,
          otp: otp,
          code: otp,
        },
      };

      const response = await axios.post(url, payload, {
        headers: {
          authkey: authKey,
          'Content-Type': 'application/json',
        },
      });

      if (response.data && (response.data.status === 'success' || response.data.type === 'success' || response.data.hasError === false)) {
        return { success: true, message: 'Email OTP sent successfully via MSG91' };
      } else {
        console.error('MSG91 Email API Response Error:', response.data);
        return {
          success: false,
          message: response.data?.message || 'Failed to send email via MSG91 API',
        };
      }
    } catch (err) {
      console.error('MSG91 Email API Exception:', err?.response?.data || err.message);
      return {
        success: false,
        message: err?.response?.data?.message || err.message || 'Error connecting to MSG91 Email API',
      };
    }
  }

  // ── Dev / Simulation Mode ──────────────────────────────────────────────────
  console.log(`\n==================================================`);
  console.log(`[MSG91 EMAIL DEV SIMULATION MODE] OTP Sent to: ${cleanEmail}`);
  console.log(`[MSG91 EMAIL DEV SIMULATION MODE] 6-Digit OTP Code: ${otp}`);
  console.log(`==================================================\n`);

  return {
    success: true,
    message: `OTP code sent to ${cleanEmail} (Dev Simulation Mode)`,
    simulated: true,
  };
};
