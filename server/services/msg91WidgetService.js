import axios from 'axios';

/**
 * Verify MSG91 Widget Verification Token / AccessToken
 * @param {string} verificationToken - Token returned by MSG91 OTP Widget SDK on client side
 * @returns {Promise<{ success: boolean, mobile?: string, message?: string }>}
 */
export async function verifyWidgetToken(verificationToken) {
  const widgetId = process.env.MSG91_WIDGET_ID;
  const tokenAuth = process.env.MSG91_TOKEN_AUTH;

  if (!verificationToken || typeof verificationToken !== 'string') {
    return { success: false, message: 'Invalid or missing verification token' };
  }

  // Check if live MSG91 Widget credentials exist in environment
  if (tokenAuth && tokenAuth !== 'your_msg91_token_auth' && widgetId && widgetId !== 'your_msg91_widget_id') {
    try {
      const response = await axios.post(
        'https://control.msg91.com/api/v5/widget/verifyAccessToken',
        {
          widgetId,
          tokenAuth,
          'access-token': verificationToken.trim(),
        },
        {
          headers: {
            authkey: tokenAuth,
            'Content-Type': 'application/json',
          },
        }
      );

      const resData = response.data;
      if (resData && (resData.type === 'success' || resData.status === 'success' || resData.message?.toLowerCase().includes('success'))) {
        // Extract mobile number from response fields
        const rawMobile = resData.mobile || resData.mobile_number || resData.response?.mobile || resData.data?.mobile;
        const cleanedMobile = rawMobile ? String(rawMobile).replace(/\D/g, '').slice(-10) : '';

        return {
          success: true,
          mobile: cleanedMobile,
          message: 'MSG91 Widget Token verified successfully',
        };
      } else {
        return {
          success: false,
          message: resData?.message || 'MSG91 Widget verification failed or token expired',
        };
      }
    } catch (err) {
      console.error('MSG91 Widget Token Verification Error:', err?.response?.data || err.message);
      return {
        success: false,
        message: err?.response?.data?.message || err.message || 'Error verifying token with MSG91 Widget API',
      };
    }
  }

  // Dev / Simulation Mode Fallback (when MSG91 Widget environment variables are not set)
  console.log('MSG91 Widget credentials missing in environment. Running in Dev/Simulation Mode.');
  // If verificationToken starts with 'sim_' or in dev mode:
  const simMatch = verificationToken.match(/sim_(\d{10})/);
  const mobile = simMatch ? simMatch[1] : '9876543210';

  return {
    success: true,
    mobile: mobile,
    message: 'Verification token validated (Dev Simulation Mode)',
  };
}
