import 'dart:async';
import '../../core/widgets/partner_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/constants/api_constants.dart';
import '../../shared/providers/websocket_provider.dart';
import '../../shared/providers/auth_provider.dart';
import '../../shared/providers/dio_provider.dart';
import '../../shared/providers/bottom_nav_provider.dart';
import 'home_dashboard_screen.dart';
import '../properties/properties_list_screen.dart';
import '../earnings/earnings_screen.dart';
import '../support/support_screen.dart';
import '../profile/profile_screen.dart';

class BottomNavShell extends ConsumerStatefulWidget {
  const BottomNavShell({super.key});

  @override
  ConsumerState<BottomNavShell> createState() => _BottomNavShellState();
}

class _BottomNavShellState extends ConsumerState<BottomNavShell> {
  Timer? _statusPollingTimer;

  final List<Widget> _pages = const [
    HomeDashboardScreen(),
    PropertiesListScreen(),
    EarningsScreen(),
    SupportScreen(),
    ProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(webSocketProvider).connect());
    _statusPollingTimer =
        Timer.periodic(const Duration(seconds: 2), (_) => _checkLiveStatus());
  }

  Future<void> _checkLiveStatus() async {
    if (!mounted) return;
    try {
      final dio = ref.read(dioClientProvider).dio;
      final res = await dio.get(ApiConstants.getProfile);
      if (res.data != null &&
          res.data['success'] == true &&
          res.data['data'] != null) {
        final status = res.data['data']['status']?.toString();
        if (status != null && status != 'APPROVED') {
          _statusPollingTimer?.cancel();
          final reason = res.data['data']['rejectionReason']?.toString();
          ref
              .read(authProvider.notifier)
              .updateAgentState(status, rejectionReason: reason);
        }
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _statusPollingTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final currentIndex = ref.watch(bottomNavIndexProvider);
    return Scaffold(
      body: IndexedStack(index: currentIndex, children: _pages),
      bottomNavigationBar: PartnerNavigation(
          index: currentIndex,
          onChanged: (index) {
            HapticFeedback.selectionClick();
            ref.read(bottomNavIndexProvider.notifier).state = index;
          }),
    );
  }
}
