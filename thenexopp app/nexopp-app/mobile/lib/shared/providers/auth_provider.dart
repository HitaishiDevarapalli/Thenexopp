import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../core/constants/api_constants.dart';
import '../../core/storage/secure_storage_service.dart';
import 'dio_provider.dart';

enum AuthStatus { unauthenticated, authenticating, authenticated }

class AuthState {
  final AuthStatus status;
  final String? agentState; // NEW, PROFILE_INCOMPLETE, KYC_INCOMPLETE, BANK_DETAILS_INCOMPLETE, PENDING_APPROVAL, APPROVED, REJECTED, SUSPENDED
  final String? mobileNumber;
  final String? rejectionReason;
  final String? errorMessage;

  AuthState({
    required this.status,
    this.agentState,
    this.mobileNumber,
    this.rejectionReason,
    this.errorMessage,
  });

  AuthState copyWith({
    AuthStatus? status,
    String? agentState,
    String? mobileNumber,
    String? rejectionReason,
    String? errorMessage,
  }) {
    return AuthState(
      status: status ?? this.status,
      agentState: agentState ?? this.agentState,
      mobileNumber: mobileNumber ?? this.mobileNumber,
      rejectionReason: rejectionReason ?? this.rejectionReason,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final SecureStorageService _storage;
  final Ref _ref;

  AuthNotifier(this._storage, this._ref)
      : super(AuthState(status: AuthStatus.authenticating)) {
    checkInitialAuth();
  }

  Future<void> checkInitialAuth() async {
    try {
      final token = await _storage.getAccessToken();
      final refreshToken = await _storage.getRefreshToken();
      final savedState = await _storage.getAgentState();

      if (token != null && token.isNotEmpty) {
        // Instant restore so existing user opens directly to their dashboard/current screen
        state = state.copyWith(
          status: AuthStatus.authenticated,
          agentState: savedState ?? 'APPROVED',
        );

        // Sync live profile state in background
        try {
          final dio = _ref.read(dioClientProvider).dio;
          final res = await dio.get(ApiConstants.getProfile);
          if (res.data['success'] == true && res.data['data'] != null) {
            final latestStatus = res.data['data']['status'] ?? savedState ?? 'APPROVED';
            final rejectionReason = res.data['data']['rejectionReason'];
            await _storage.updateAgentState(latestStatus);
            state = state.copyWith(
              status: AuthStatus.authenticated,
              agentState: latestStatus,
              rejectionReason: rejectionReason,
            );
          }
        } catch (_) {
          // Token is valid; keep authenticated state even if offline
        }
      } else if (refreshToken != null && refreshToken.isNotEmpty) {
        // Attempt automatic refresh if access token expired
        try {
          final dio = _ref.read(dioClientProvider).dio;
          final res = await dio.post(ApiConstants.refreshToken, data: {'refreshToken': refreshToken});
          if (res.data['success'] == true) {
            final data = res.data['data'];
            final agentState = data['agentState'] ?? 'APPROVED';
            await _storage.saveTokens(
              accessToken: data['accessToken'],
              refreshToken: data['refreshToken'],
              agentState: agentState,
              userId: await _storage.getUserId() ?? '',
              agentId: await _storage.getAgentId(),
            );
            state = state.copyWith(
              status: AuthStatus.authenticated,
              agentState: agentState,
            );
            return;
          }
        } catch (_) {}
        state = state.copyWith(status: AuthStatus.unauthenticated);
      } else {
        state = state.copyWith(status: AuthStatus.unauthenticated);
      }
    } catch (_) {
      state = state.copyWith(status: AuthStatus.unauthenticated);
    }
  }

  void setMobileNumber(String mobileNumber) {
    state = state.copyWith(mobileNumber: mobileNumber, errorMessage: null);
  }

  Future<bool> sendOtp(String mobileNumber) async {
    state = state.copyWith(mobileNumber: mobileNumber, errorMessage: null);
    try {
      final dio = _ref.read(dioClientProvider).dio;
      final response = await dio.post(ApiConstants.sendOtp, data: {'mobileNumber': mobileNumber});
      if (response.statusCode == 200 || response.statusCode == 201) {
        return true;
      }
      return false;
    } on DioException catch (e) {
      String msg = 'Failed to send OTP. Please check your network connection.';
      if (e.response?.data is Map && e.response?.data['message'] != null) {
        msg = e.response!.data['message'].toString();
      }
      state = state.copyWith(errorMessage: msg);
      return false;
    } catch (e) {
      state = state.copyWith(errorMessage: 'Failed to send OTP: $e');
      return false;
    }
  }

  Future<bool> verifyOtp(String mobileNumber, String otp) async {
    debugPrint('[AuthNotifier] verifyOtp called with mobile: "$mobileNumber", otp: "$otp"');
    try {
      final dio = _ref.read(dioClientProvider).dio;
      final response = await dio.post(ApiConstants.verifyOtp, data: {
        'mobileNumber': mobileNumber,
        'otp': otp,
      });

      debugPrint('[AuthNotifier] verifyOtp response status: ${response.statusCode}, data: ${response.data}');

      if (response.data['success'] == true) {
        final data = response.data['data'];
        final agentState = data['agentState'] ?? 'NEW';

        try {
          await _storage.saveTokens(
            accessToken: data['accessToken'],
            refreshToken: data['refreshToken'],
            agentState: agentState,
            userId: data['user']['id'],
            agentId: data['user']['agentId'],
          );
        } catch (storageErr) {
          debugPrint('[AuthNotifier] Storage error ignored: $storageErr');
        }

        state = AuthState(
          status: AuthStatus.authenticated,
          agentState: agentState,
          mobileNumber: mobileNumber,
        );
        return true;
      }
    } on DioException catch (e) {
      debugPrint('[AuthNotifier] DioException: ${e.message}, response: ${e.response?.data}');
      String msg = 'Invalid or expired OTP code entered';
      if (e.response?.data is Map && e.response?.data['message'] != null) {
        msg = e.response!.data['message'].toString();
      }
      state = state.copyWith(errorMessage: msg);
    } catch (e, stack) {
      debugPrint('[AuthNotifier] Unexpected error: $e\n$stack');
      state = state.copyWith(errorMessage: 'Verification failed: $e');
    }
    return false;
  }

  void updateAgentState(String newState, {String? rejectionReason}) {
    _storage.updateAgentState(newState);
    state = state.copyWith(agentState: newState, rejectionReason: rejectionReason);
  }

  Future<void> logout() async {
    try {
      final dio = _ref.read(dioClientProvider).dio;
      await dio.post(ApiConstants.logout);
    } catch (_) {}
    await _storage.clearAll();
    state = AuthState(status: AuthStatus.unauthenticated);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final storage = ref.watch(secureStorageProvider);
  return AuthNotifier(storage, ref);
});
