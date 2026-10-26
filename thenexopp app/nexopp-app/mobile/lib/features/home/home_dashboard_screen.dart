import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/state_widgets.dart';
import '../../core/widgets/app_network_image.dart';
import '../../core/widgets/partner_ui.dart';
import '../../core/constants/api_constants.dart';
import '../../core/services/permission_service.dart';
import '../../shared/providers/dio_provider.dart';
import '../../shared/providers/bottom_nav_provider.dart';
import '../notifications/notifications_screen.dart';

class HomeDashboardScreen extends ConsumerStatefulWidget {
  const HomeDashboardScreen({super.key});
  @override
  ConsumerState<HomeDashboardScreen> createState() =>
      _HomeDashboardScreenState();
}

class _HomeDashboardScreenState extends ConsumerState<HomeDashboardScreen> {
  bool _isLoading = true;
  String? _error;
  String _agentName = 'Agent Partner';
  String? _profilePhotoUrl;
  Map<String, dynamic> _summary = {};
  List<dynamic> _properties = [];

  @override
  void initState() {
    super.initState();
    _fetchDashboardData();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) PermissionService.requestAllAppPermissions(context);
    });
  }

  Future<void> _fetchDashboardData() async {
    if (mounted)
      setState(() {
        _error = null;
        _isLoading = true;
      });
    try {
      final dio = ref.read(dioClientProvider).dio;
      final responses = await Future.wait([
        dio.get(ApiConstants.getProfile),
        dio.get(ApiConstants.earnings),
        dio.get(ApiConstants.properties),
      ]);
      if (responses.any((response) => response.data['success'] != true)) {
        throw StateError('Dashboard unavailable');
      }
      if (!mounted) return;
      setState(() {
        final profile = responses[0].data['data']?['profile'];
        _agentName = profile?['fullName'] ?? 'Agent Partner';
        _profilePhotoUrl = profile?['profilePhotoUrl'];
        _summary = Map<String, dynamic>.from(
            responses[1].data['data']?['summary'] ?? {});
        _properties = responses[2].data['data'] as List? ?? [];
        _isLoading = false;
      });
    } catch (_) {
      if (mounted)
        setState(() {
          _isLoading = false;
          _error = 'We couldn’t refresh your overview. Please try again.';
        });
    }
  }

  void _openTab(int index) =>
      ref.read(bottomNavIndexProvider.notifier).state = index;

  @override
  Widget build(BuildContext context) {
    final hour = DateTime.now().hour;
    final greeting = hour < 12
        ? 'Good morning'
        : hour < 17
            ? 'Good afternoon'
            : 'Good evening';
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        titleSpacing: 24,
        title: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('TheNexopp',
                  style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -1)),
              PartnerEyebrow('Partner workspace'),
            ]),
        actions: [
          IconButton.outlined(
              tooltip: 'Notifications',
              onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (_) => const NotificationsScreen())),
              icon: const Icon(Icons.notifications_none_rounded, size: 22)),
          const SizedBox(width: 20),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchDashboardData,
        child: _isLoading
            ? const LoadingSkeletonList()
            : _error != null
                ? ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: [
                        ErrorStateWidget(
                            message: _error!, onRetry: _fetchDashboardData),
                      ])
                : ListView(
                    padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: [
                      Row(children: [
                        Expanded(
                            child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                              Text('$greeting,',
                                  style:
                                      Theme.of(context).textTheme.bodyMedium),
                              const SizedBox(height: 6),
                              Text(_agentName,
                                  style: Theme.of(context)
                                      .textTheme
                                      .headlineMedium),
                            ])),
                        const SizedBox(width: 12),
                        InkWell(
                            onTap: () => _openTab(4),
                            borderRadius: BorderRadius.circular(18),
                            child: Semantics(
                                button: true,
                                label: 'Open your profile',
                                child: AppNetworkImage(
                                    imageSource: _profilePhotoUrl,
                                    bucket: 'profile-photos',
                                    width: 52,
                                    height: 52,
                                    borderRadius: BorderRadius.circular(18),
                                    fallbackIcon: Icons.person_outline_rounded,
                                    fallbackIconSize: 24))),
                      ]),
                      const SizedBox(height: 24),
                      PartnerBalanceCard(
                          label: 'Total earnings',
                          amount: partnerCurrency(_summary['totalEarnings']),
                          onTap: () => _openTab(2),
                          metrics: [
                            (
                              label: 'Pending payout',
                              value:
                                  partnerCurrency(_summary['pendingEarnings'])
                            ),
                            (
                              label: 'Paid to you',
                              value: partnerCurrency(_summary['paidAmount'])
                            ),
                          ]),
                      const SizedBox(height: 24),
                      FilledButton.icon(
                        onPressed: () async {
                          await context.push('/properties/add');
                          if (mounted) _fetchDashboardData();
                        },
                        style: FilledButton.styleFrom(
                            backgroundColor: AppColors.primaryDark,
                            padding: const EdgeInsets.symmetric(vertical: 18),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16))),
                        icon: const Icon(Icons.add_rounded, size: 22),
                        label: const Text('Create a new listing'),
                      ),
                      PartnerSection('Your portfolio',
                          action: 'View listings', onAction: () => _openTab(1)),
                      PartnerSurface(
                          child: Row(children: [
                        _portfolioMetric('All listings', _properties.length,
                            Icons.domain_outlined),
                        const SizedBox(width: 12),
                        _portfolioMetric(
                            'Approved',
                            _properties
                                .where((p) => p['status'] == 'APPROVED')
                                .length,
                            Icons.task_alt_rounded),
                        const SizedBox(width: 12),
                        _portfolioMetric(
                            'In review',
                            _properties
                                .where((p) => ['SUBMITTED', 'UNDER_REVIEW']
                                    .contains(p['status']))
                                .length,
                            Icons.schedule_rounded),
                      ])),
                      PartnerSection('Recent listings',
                          action: 'See all', onAction: () => _openTab(1)),
                      if (_properties.isEmpty)
                        PartnerSurface(
                            child: EmptyStateWidget(
                                title: 'Your next opportunity starts here',
                                message:
                                    'Add your first property and follow its progress, all in one place.',
                                icon: Icons.add_home_outlined,
                                buttonText: 'Add your first listing',
                                onAction: () =>
                                    context.push('/properties/add')))
                      else
                        ..._properties.take(3).map((property) => Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: PartnerListingCard(
                                  property: Map<String, dynamic>.from(property),
                                  compact: true,
                                  onTap: () => context
                                      .push('/properties/${property['id']}')),
                            )),
                      const SizedBox(height: 16),
                      Material(
                          color: AppColors.lightSage,
                          borderRadius: BorderRadius.circular(20),
                          child: ListTile(
                              contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 20, vertical: 8),
                              leading: const Icon(Icons.support_agent_rounded,
                                  color: AppColors.primaryDark),
                              title: const Text('A little help goes a long way',
                                  style: TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 13)),
                              subtitle: const Text(
                                  'Your partner desk is a tap away.',
                                  style: TextStyle(fontSize: 12)),
                              trailing: const Icon(Icons.arrow_forward_rounded,
                                  size: 18),
                              onTap: () => _openTab(3))),
                      const SizedBox(height: 28),
                      const Center(child: PartnerEyebrow('Where next happens')),
                    ],
                  ),
      ),
    );
  }

  Widget _portfolioMetric(String label, int count, IconData icon) => Expanded(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Icon(icon, size: 21, color: AppColors.mutedSage),
          const SizedBox(height: 12),
          Text('$count', style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 4),
          Text(label, style: Theme.of(context).textTheme.bodySmall),
        ]),
      );
}
