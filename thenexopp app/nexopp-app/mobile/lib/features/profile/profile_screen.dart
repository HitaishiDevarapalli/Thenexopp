import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/partner_ui.dart';
import '../../core/widgets/app_network_image.dart';
import '../../core/widgets/state_widgets.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/api_constants.dart';
import '../../shared/providers/dio_provider.dart';
import '../../shared/providers/auth_provider.dart';
import '../support/support_screen.dart';
import 'verification_details_screen.dart';
import 'terms_privacy_screen.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _isLoading = true;
  String? _error;
  Map<String, dynamic>? _agentData;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final dio = ref.read(dioClientProvider).dio;
      final res = await dio.get(ApiConstants.getProfile);
      if (res.data['success'] != true) throw StateError('Profile unavailable');
      if (mounted) {
        setState(() {
          _agentData = res.data['data'];
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted)
        setState(() {
          _isLoading = false;
          _error = 'Couldn’t load your profile. Please try again.';
        });
    }
  }

  @override
  Widget build(BuildContext context) {
    final profile = _agentData?['profile'];
    return Scaffold(
      appBar: AppBar(title: const Text('Your profile'), actions: [
        IconButton(
            tooltip: 'Sign out',
            onPressed: _confirmLogout,
            icon:
                const Icon(Icons.logout_rounded, color: AppColors.statusError)),
        const SizedBox(width: 8),
      ]),
      body: RefreshIndicator(
        onRefresh: _fetchProfile,
        child: _isLoading
            ? const LoadingSkeletonList()
            : _error != null
                ? ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: [
                        ErrorStateWidget(
                            message: _error!, onRetry: _fetchProfile)
                      ])
                : ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
                    children: [
                        PartnerSurface(
                            child: Column(children: [
                          AppNetworkImage(
                              imageSource: profile?['profilePhotoUrl'],
                              bucket: 'profile-photos',
                              width: 88,
                              height: 88,
                              borderRadius: BorderRadius.circular(28),
                              fallbackIcon: Icons.person_outline_rounded),
                          const SizedBox(height: 18),
                          const PartnerEyebrow('TheNexopp partner'),
                          const SizedBox(height: 10),
                          Text('${profile?['fullName'] ?? 'Agent Partner'}',
                              textAlign: TextAlign.center,
                              style:
                                  Theme.of(context).textTheme.headlineMedium),
                          const SizedBox(height: 8),
                          Text('+91 ${_agentData?['mobileNumber'] ?? ''}',
                              style: Theme.of(context).textTheme.bodyMedium),
                          const SizedBox(height: 16),
                          PartnerStatus(
                              '${_agentData?['status'] ?? 'PENDING'}'),
                        ])),
                        const PartnerSection('The essentials'),
                        PartnerSurface(
                            child: Column(children: [
                          _detail(
                              Icons.location_on_outlined,
                              'Operating location',
                              '${profile?['areaLocation'] ?? 'Not provided'}'),
                          const Divider(height: 32),
                          _detail(Icons.work_outline_rounded, 'Occupation',
                              '${profile?['workPlatform'] ?? 'Not provided'}'),
                        ])),
                        const PartnerSection('Account verification'),
                        PartnerSurface(
                            child: Column(children: [
                          _verification(
                              'Identity & KYC',
                              Icons.verified_user_outlined,
                              '${_agentData?['kycStatus'] ?? 'NOT_SUBMITTED'}',
                              () => _openDetails(VerificationDetailsKind.kyc)),
                          const Divider(height: 32),
                          _verification(
                              'Bank account',
                              Icons.account_balance_outlined,
                              '${_agentData?['bankStatus'] ?? 'NOT_SUBMITTED'}',
                              () => _openDetails(VerificationDetailsKind.bank)),
                        ])),
                        const SizedBox(height: 24),
                        Material(
                            color: AppColors.lightSage,
                            borderRadius: BorderRadius.circular(20),
                            child: ListTile(
                                contentPadding: const EdgeInsets.all(16),
                                leading: const Icon(Icons.support_agent_rounded,
                                    color: AppColors.mutedSage),
                                title: const Text('Agent help & support',
                                    style:
                                        TextStyle(fontWeight: FontWeight.w600)),
                                subtitle: const Text(
                                    'Contact your partner desk',
                                    style: TextStyle(fontSize: 12)),
                                trailing: const Icon(
                                    Icons.arrow_forward_rounded,
                                    size: 20),
                                onTap: () => Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                        builder: (_) =>
                                            const SupportScreen())))),
                        const SizedBox(height: 16),
                        Card(
                            child: ListTile(
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 20, vertical: 12),
                          leading: const Icon(Icons.description_outlined,
                              color: AppColors.mutedSage),
                          title: const Text('Terms & privacy'),
                          subtitle: const Text('Read the app policies',
                              style: TextStyle(fontSize: 12)),
                          trailing: const Icon(Icons.chevron_right_rounded),
                          onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (_) => const TermsPrivacyScreen())),
                        )),
                        const SizedBox(height: 24),
                        OutlinedButton.icon(
                            onPressed: _confirmLogout,
                            icon: const Icon(Icons.logout_rounded, size: 18),
                            label: const Text('Sign out'),
                            style: OutlinedButton.styleFrom(
                                foregroundColor: AppColors.statusError)),
                        const SizedBox(height: 28),
                        const Center(
                            child: PartnerEyebrow('Where next happens')),
                      ]),
      ),
    );
  }

  Widget _detail(IconData icon, String label, String value) => Row(children: [
        Icon(icon, color: AppColors.mutedSage, size: 22),
        const SizedBox(width: 14),
        Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 6),
          Text(value, style: Theme.of(context).textTheme.titleSmall),
        ])),
      ]);

  void _openDetails(VerificationDetailsKind kind) => Navigator.push(context,
      MaterialPageRoute(builder: (_) => VerificationDetailsScreen(kind: kind)));

  Widget _verification(
          String label, IconData icon, String status, VoidCallback onTap) =>
      ListTile(
        contentPadding: EdgeInsets.zero,
        leading: Icon(icon, color: AppColors.mutedSage, size: 22),
        title: Text(label, style: Theme.of(context).textTheme.titleSmall),
        subtitle: Padding(
            padding: const EdgeInsets.only(top: 10),
            child: Align(
                alignment: Alignment.centerLeft, child: PartnerStatus(status))),
        trailing: const Icon(Icons.chevron_right_rounded),
        onTap: onTap,
      );

  Future<void> _confirmLogout() async {
    final confirmed = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
              title: const Text('Sign out?'),
              content: const Text(
                  'You can sign back in with your mobile number whenever you’re ready.'),
              actions: [
                TextButton(
                    onPressed: () => Navigator.pop(context, false),
                    child: const Text('Stay here')),
                TextButton(
                    onPressed: () => Navigator.pop(context, true),
                    child: const Text('Sign out'))
              ],
            ));
    if (confirmed == true && mounted) ref.read(authProvider.notifier).logout();
  }
}
