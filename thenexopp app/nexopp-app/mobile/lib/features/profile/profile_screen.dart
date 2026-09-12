import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/api_constants.dart';
import '../../shared/providers/dio_provider.dart';
import '../../shared/providers/auth_provider.dart';
import '../support/support_screen.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _agentData;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    try {
      final dio = ref.read(dioClientProvider).dio;
      final res = await dio.get(ApiConstants.getProfile);
      if (mounted && res.data['success'] == true) {
        setState(() {
          _agentData = res.data['data'];
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final profile = _agentData?['profile'];

    return Scaffold(
      backgroundColor: AppColors.primaryBg,
      appBar: AppBar(
        title: Text(
          'Agent Profile',
          style: GoogleFonts.plusJakartaSans(
            fontWeight: FontWeight.w700,
            fontSize: 18,
            color: AppColors.charcoal,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: AppColors.statusError, size: 22),
            onPressed: () => ref.read(authProvider.notifier).logout(),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.charcoal))
          : SingleChildScrollView(
              physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
              child: Column(
                children: [
                  const SizedBox(height: 8),

                  // Avatar & Verified Badge Header (Card Surface)
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: AppColors.cardSurface,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: AppColors.subtleBorder),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 18, offset: const Offset(0, 5)),
                      ],
                    ),
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 46,
                          backgroundColor: AppColors.warmBeige,
                          backgroundImage: profile?['profilePhotoUrl'] != null && profile!['profilePhotoUrl'].toString().startsWith('http')
                              ? NetworkImage(profile!['profilePhotoUrl'])
                              : null,
                          child: profile?['profilePhotoUrl'] == null || !profile!['profilePhotoUrl'].toString().startsWith('http')
                              ? Text(
                                  profile?['fullName']?.substring(0, 1).toUpperCase() ?? 'A',
                                  style: GoogleFonts.plusJakartaSans(fontSize: 36, fontWeight: FontWeight.w800, color: AppColors.charcoal),
                                )
                              : null,
                        ),
                        const SizedBox(height: 14),
                        Text(
                          profile?['fullName'] ?? 'Agent Partner',
                          style: GoogleFonts.plusJakartaSans(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.charcoal, letterSpacing: -0.3),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '+91 ${_agentData?['mobileNumber'] ?? ''}',
                          style: GoogleFonts.plusJakartaSans(color: AppColors.secondaryText, fontSize: 14, fontWeight: FontWeight.w500),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            _buildStatusPill('KYC: ${_agentData?['kycStatus'] ?? 'APPROVED'}', AppColors.sageGreen, AppColors.lightSage),
                            const SizedBox(width: 10),
                            _buildStatusPill('Bank: ${_agentData?['bankStatus'] ?? 'VERIFIED'}', AppColors.charcoal, AppColors.secondaryBg),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Profile Info Card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.cardSurface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.subtleBorder),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
                      ],
                    ),
                    child: Column(
                      children: [
                        _buildDetailRow(Icons.location_on_rounded, 'Operating Location', profile?['areaLocation'] ?? 'N/A'),
                        const Divider(color: AppColors.subtleBorder, height: 24),
                        _buildDetailRow(Icons.work_outline_rounded, 'Occupation / Work', profile?['workPlatform'] ?? 'Partner Agent'),
                        const Divider(color: AppColors.subtleBorder, height: 24),
                        _buildDetailRow(Icons.cake_rounded, 'Age & Gender', '${profile?['age'] ?? 'N/A'} yrs • ${profile?['gender'] ?? ''}'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Actions & Security Section
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.cardSurface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.subtleBorder),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
                      ],
                    ),
                    child: Column(
                      children: [
                        ListTile(
                          leading: const Icon(Icons.shield_rounded, color: AppColors.charcoal),
                          title: Text('Masked KYC Documents', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w600, fontSize: 14, color: AppColors.charcoal)),
                          subtitle: Text('Aadhaar: XXXX XXXX 1234 • PAN: XXXXX1234X', style: GoogleFonts.plusJakartaSans(fontSize: 12, color: AppColors.secondaryText)),
                          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.secondaryText),
                          onTap: () {},
                        ),
                        const Divider(color: AppColors.subtleBorder, height: 1),
                        ListTile(
                          leading: const Icon(Icons.account_balance_rounded, color: AppColors.charcoal),
                          title: Text('Masked Bank & Payout Details', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w600, fontSize: 14, color: AppColors.charcoal)),
                          subtitle: Text('Account: XXXX XXXX 4521 • Verified', style: GoogleFonts.plusJakartaSans(fontSize: 12, color: AppColors.secondaryText)),
                          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.secondaryText),
                          onTap: () {},
                        ),
                        const Divider(color: AppColors.subtleBorder, height: 1),
                        ListTile(
                          leading: const Icon(Icons.help_outline_rounded, color: AppColors.charcoal),
                          title: Text('Agent Help & Support', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w600, fontSize: 14, color: AppColors.charcoal)),
                          subtitle: Text('Raise issues or call partner desk', style: GoogleFonts.plusJakartaSans(fontSize: 12, color: AppColors.secondaryText)),
                          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.secondaryText),
                          onTap: () {
                            Navigator.push(context, MaterialPageRoute(builder: (_) => const SupportScreen()));
                          },
                        ),
                        const Divider(color: AppColors.subtleBorder, height: 1),
                        ListTile(
                          leading: const Icon(Icons.description_outlined, color: AppColors.charcoal),
                          title: Text('Terms & Privacy Policy', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w600, fontSize: 14, color: AppColors.charcoal)),
                          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.secondaryText),
                          onTap: () {},
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),

                  OutlinedButton.icon(
                    onPressed: () => ref.read(authProvider.notifier).logout(),
                    icon: const Icon(Icons.logout_rounded, color: AppColors.statusError),
                    label: Text('Logout Securely', style: GoogleFonts.plusJakartaSans(color: AppColors.statusError, fontWeight: FontWeight.w700)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppColors.statusError, width: 1.5),
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildStatusPill(String label, Color color, Color bg) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(20), border: Border.all(color: color.withOpacity(0.3))),
      child: Text(label, style: GoogleFonts.plusJakartaSans(fontSize: 12, fontWeight: FontWeight.w700, color: color)),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Icon(icon, size: 18, color: AppColors.charcoal),
        const SizedBox(width: 10),
        Text(
          label,
          style: GoogleFonts.plusJakartaSans(
            color: AppColors.secondaryText,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: GoogleFonts.plusJakartaSans(
              fontWeight: FontWeight.w700,
              fontSize: 13,
              color: AppColors.charcoal,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}
