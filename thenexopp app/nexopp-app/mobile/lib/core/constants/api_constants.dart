import 'package:flutter/foundation.dart';

class ApiConstants {
  // Base URLs (Dynamically resolves to localhost:3000 in local dev/web and live VPS in prod)
  static String get baseUrl {
    if (kIsWeb) {
      final host = Uri.base.host;
      if (host.isEmpty || host == 'localhost' || host == '127.0.0.1') {
        return 'http://localhost:3000/api/v1';
      }
      final portStr = (Uri.base.port == 3000 || Uri.base.port == 80 || Uri.base.port == 443 || Uri.base.port == 0) ? '' : ':3000';
      return '${Uri.base.scheme}://${Uri.base.host}$portStr/api/v1';
    }
    if (kReleaseMode) {
      return prodBaseUrl;
    }
    return 'http://localhost:3000/api/v1';
  }

  static String get webSocketUrl {
    if (kIsWeb) {
      final host = Uri.base.host;
      if (host.isEmpty || host == 'localhost' || host == '127.0.0.1') {
        return 'http://localhost:3000/ws';
      }
      final portStr = (Uri.base.port == 3000 || Uri.base.port == 80 || Uri.base.port == 443 || Uri.base.port == 0) ? '' : ':3000';
      return '${Uri.base.scheme}://${Uri.base.host}$portStr/ws';
    }
    if (kReleaseMode) {
      return prodWebSocketUrl;
    }
    return 'http://localhost:3000/ws';
  }

  // Production fallback domain
  static const String prodBaseUrl = 'https://thenexopp.com/api/v1';
  static const String prodWebSocketUrl = 'wss://thenexopp.com/ws';


  // Auth Endpoints
  static const String sendOtp = '/auth/send-otp';
  static const String verifyOtp = '/auth/verify-otp';
  static const String refreshToken = '/auth/refresh';
  static const String logout = '/auth/logout';

  // Agent & Onboarding
  static const String getProfile = '/agent/profile';
  static const String updateProfile = '/agent/profile';
  static const String kycDetails = '/agent/kyc';
  static const String submitKyc = '/agent/kyc';
  static const String bankDetails = '/agent/bank-details';
  static const String submitBankDetails = '/agent/bank-details';

  // Properties
  static const String properties = '/properties';
  static const String createProperty = '/properties';
  static String submitProperty(String id) => '/properties/$id/submit';

  // Financials
  static const String earnings = '/earnings';
  static const String payments = '/payments';

  // Notifications
  static const String notifications = '/notifications';
  static const String markAllRead = '/notifications/read-all';

  // Uploads
  static const String presignedUrl = '/uploads/presigned-url';
  static const String secureViewUrl = '/uploads/secure-view-url';
  static const String directUpload = '/uploads/direct-upload';

  // Support & Helpdesk
  static const String supportTickets = '/support/tickets';
}
