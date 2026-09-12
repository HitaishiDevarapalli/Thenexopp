import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../shared/providers/auth_provider.dart';
import '../features/splash/splash_screen.dart';
import '../features/auth/login_screen.dart';
import '../features/auth/otp_verification_screen.dart';
import '../features/onboarding/profile_onboarding_screen.dart';
import '../features/onboarding/kyc_onboarding_screen.dart';
import '../features/onboarding/bank_onboarding_screen.dart';
import '../features/status/pending_approval_screen.dart';
import '../features/status/rejected_screen.dart';
import '../features/status/suspended_screen.dart';
import '../features/home/bottom_nav_shell.dart';
import '../features/properties/add_property_screen.dart';
import '../features/properties/property_details_screen.dart';

class RouterNotifier extends ChangeNotifier {
  final Ref _ref;

  RouterNotifier(this._ref) {
    _ref.listen<AuthState>(
      authProvider,
      (_, __) => notifyListeners(),
    );
  }
}

final routerNotifierProvider = Provider<RouterNotifier>((ref) {
  return RouterNotifier(ref);
});

final routerProvider = Provider<GoRouter>((ref) {
  final notifier = ref.watch(routerNotifierProvider);

  return GoRouter(
    refreshListenable: notifier,
    initialLocation: '/',
    redirect: (context, state) {
      final authState = ref.read(authProvider);
      final isAuthenticating = authState.status == AuthStatus.authenticating;
      final isAuthenticated = authState.status == AuthStatus.authenticated;
      final currentLoc = state.uri.path;

      // 1. The carousel screen (at '/') ALWAYS opens first when launching the app
      if (currentLoc == '/') {
        return null;
      }

      if (isAuthenticating) {
        return null;
      }

      // 2. Unauthenticated user handling
      if (!isAuthenticated) {
        if (currentLoc == '/login' || currentLoc == '/otp') return null;
        return '/';
      }

      // 3. Authenticated user handling
      final agentState = authState.agentState ?? 'APPROVED';

      // If already logged in and at login/otp, route to appropriate home/onboarding screen
      if (currentLoc == '/login' || currentLoc == '/otp') {
        switch (agentState) {
          case 'NEW':
          case 'PROFILE_INCOMPLETE':
            return '/onboarding/profile';
          case 'KYC_INCOMPLETE':
            return '/onboarding/kyc';
          case 'BANK_DETAILS_INCOMPLETE':
            return '/onboarding/bank';
          case 'PENDING_APPROVAL':
            return '/pending-approval';
          case 'REJECTED':
            return '/rejected';
          case 'SUSPENDED':
            return '/suspended';
          case 'APPROVED':
          default:
            return '/home';
        }
      }

      // Handle agent state navigation routing for protected routes
      switch (agentState) {
        case 'NEW':
        case 'PROFILE_INCOMPLETE':
          if (currentLoc != '/onboarding/profile') return '/onboarding/profile';
          break;
        case 'KYC_INCOMPLETE':
          if (currentLoc != '/onboarding/kyc') return '/onboarding/kyc';
          break;
        case 'BANK_DETAILS_INCOMPLETE':
          if (currentLoc != '/onboarding/bank') return '/onboarding/bank';
          break;
        case 'PENDING_APPROVAL':
          if (currentLoc != '/pending-approval') return '/pending-approval';
          break;
        case 'REJECTED':
          if (currentLoc != '/rejected') return '/rejected';
          break;
        case 'SUSPENDED':
          if (currentLoc != '/suspended') return '/suspended';
          break;
        case 'APPROVED':
          if (currentLoc != '/home' && !currentLoc.startsWith('/properties')) {
            return '/home';
          }
          break;
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/otp',
        builder: (context, state) => const OtpVerificationScreen(),
      ),
      GoRoute(
        path: '/onboarding/profile',
        builder: (context, state) => const ProfileOnboardingScreen(),
      ),
      GoRoute(
        path: '/onboarding/kyc',
        builder: (context, state) => const KycOnboardingScreen(),
      ),
      GoRoute(
        path: '/onboarding/bank',
        builder: (context, state) => const BankOnboardingScreen(),
      ),
      GoRoute(
        path: '/pending-approval',
        builder: (context, state) => const PendingApprovalScreen(),
      ),
      GoRoute(
        path: '/rejected',
        builder: (context, state) => const RejectedScreen(),
      ),
      GoRoute(
        path: '/suspended',
        builder: (context, state) => const SuspendedScreen(),
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => const BottomNavShell(),
      ),
      GoRoute(
        path: '/properties/add',
        builder: (context, state) => const AddPropertyScreen(),
      ),
      GoRoute(
        path: '/properties/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return PropertyDetailsScreen(propertyId: id);
        },
      ),
    ],
  );
});
