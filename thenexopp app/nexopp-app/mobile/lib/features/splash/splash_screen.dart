import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/partner_ui.dart';
import '../../shared/providers/auth_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});
  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  void _navigateToLogin() {
    HapticFeedback.mediumImpact();
    final authState = ref.read(authProvider);
    if (authState.status == AuthStatus.authenticated) {
      final agentState = authState.agentState ?? 'APPROVED';
      switch (agentState) {
        case 'NEW':
        case 'PROFILE_INCOMPLETE':
          context.go('/onboarding/profile');
          break;
        case 'KYC_INCOMPLETE':
          context.go('/onboarding/kyc');
          break;
        case 'BANK_DETAILS_INCOMPLETE':
          context.go('/onboarding/bank');
          break;
        case 'PENDING_APPROVAL':
          context.go('/pending-approval');
          break;
        case 'REJECTED':
          context.go('/rejected');
          break;
        case 'SUSPENDED':
          context.go('/suspended');
          break;
        case 'APPROVED':
        default:
          context.go('/home');
          break;
      }
    } else {
      context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        body: SafeArea(
            child: LayoutBuilder(
                builder: (context, constraints) => Center(
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 560),
                        child: SingleChildScrollView(
                            padding: const EdgeInsets.all(24),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                Row(children: [
                                  const Text('TheNexopp',
                                      style: TextStyle(
                                          fontSize: 24,
                                          fontWeight: FontWeight.w800,
                                          letterSpacing: -1)),
                                  const Spacer(),
                                  Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 12, vertical: 7),
                                      decoration: BoxDecoration(
                                          border: Border.all(
                                              color: AppColors.subtleBorder),
                                          borderRadius:
                                              BorderRadius.circular(8)),
                                      child: const PartnerEyebrow('Agent')),
                                ]),
                                const SizedBox(height: 24),
                                ClipRRect(
                                    borderRadius: BorderRadius.circular(30),
                                    child: Stack(children: [
                                      Image.asset('assets/images/login_bg.png',
                                          fit: BoxFit.cover,
                                          width: double.infinity,
                                          height: (constraints.maxHeight * .43)
                                              .clamp(230.0, 400.0),
                                          errorBuilder: (_, __, ___) =>
                                              const SizedBox(
                                                  height: 260,
                                                  child: ColoredBox(
                                                      color: AppColors
                                                          .lightSage))),
                                      Positioned(
                                          left: 18,
                                          bottom: 18,
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 14, vertical: 10),
                                            decoration: BoxDecoration(
                                                color: AppColors.primaryBg,
                                                borderRadius:
                                                    BorderRadius.circular(12)),
                                            child: const Row(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  Icon(Icons.north_east_rounded,
                                                      size: 16,
                                                      color:
                                                          AppColors.mutedSage),
                                                  SizedBox(width: 8),
                                                  Text('A world of opportunity',
                                                      style: TextStyle(
                                                          fontSize: 11,
                                                          fontWeight:
                                                              FontWeight.w600)),
                                                ]),
                                          )),
                                    ])),
                                const SizedBox(height: 28),
                                const PartnerEyebrow('Where next happens'),
                                const SizedBox(height: 12),
                                Text('Great spaces.\nGreater possibilities.',
                                    style: Theme.of(context)
                                        .textTheme
                                        .displayMedium
                                        ?.copyWith(
                                            fontSize: 34,
                                            fontWeight: FontWeight.w600,
                                            height: 1.15,
                                            letterSpacing: -1.4)),
                                const SizedBox(height: 14),
                                Text(
                                    'Connect people with their next property. Build your portfolio and grow with TheNexopp.',
                                    style:
                                        Theme.of(context).textTheme.bodyMedium),
                                const SizedBox(height: 28),
                                ElevatedButton(
                                    onPressed: _navigateToLogin,
                                    child: const Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Text('Get started'),
                                          SizedBox(width: 12),
                                          Icon(Icons.arrow_forward_rounded,
                                              size: 20),
                                        ])),
                                const SizedBox(height: 14),
                                const Text('Your ambition. Our network.',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                        color: AppColors.secondaryText,
                                        fontSize: 11)),
                              ],
                            )),
                      ),
                    ))),
      );
}
