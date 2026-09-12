import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/api_constants.dart';
import '../../core/services/permission_service.dart';
import '../../shared/providers/dio_provider.dart';
import '../../shared/providers/bottom_nav_provider.dart';
import '../support/support_screen.dart';
import '../notifications/notifications_screen.dart';

class HomeDashboardScreen extends ConsumerStatefulWidget {
  const HomeDashboardScreen({super.key});

  @override
  ConsumerState<HomeDashboardScreen> createState() => _HomeDashboardScreenState();
}

class _HomeDashboardScreenState extends ConsumerState<HomeDashboardScreen> {
  bool _isLoading = true;
  String _agentName = 'Agent Partner';
  String? _profilePhotoUrl;
  double _totalEarnings = 0;
  double _pendingEarnings = 0;
  double _paidAmount = 0;
  int _propertyCount = 0;
  String _kycStatus = 'APPROVED';
  List<dynamic> _properties = [];

  @override
  void initState() {
    super.initState();
    _fetchDashboardData();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      PermissionService.requestAllAppPermissions(context);
    });
  }

  Future<void> _fetchDashboardData() async {
    try {
      final dio = ref.read(dioClientProvider).dio;
      final profileRes = await dio.get(ApiConstants.getProfile);
      final earningsRes = await dio.get(ApiConstants.earnings);
      final propertiesRes = await dio.get(ApiConstants.properties);

      if (mounted) {
        setState(() {
          if (profileRes.data['success'] == true) {
            final p = profileRes.data['data']['profile'];
            if (p != null) {
              _agentName = p['fullName'] ?? 'Agent Partner';
              _profilePhotoUrl = p['profilePhotoUrl'];
            }
            _kycStatus = profileRes.data['data']['kycStatus'] ?? 'APPROVED';
          }

          if (earningsRes.data != null && earningsRes.data['success'] == true && earningsRes.data['data'] != null) {
            final summary = earningsRes.data['data']['summary'] ?? {};
            _totalEarnings = (summary['totalEarnings'] ?? 0).toDouble();
            _pendingEarnings = (summary['pendingEarnings'] ?? 0).toDouble();
            _paidAmount = (summary['paidAmount'] ?? 0).toDouble();
          }

          if (propertiesRes.data != null && propertiesRes.data['success'] == true && propertiesRes.data['data'] != null) {
            _properties = propertiesRes.data['data'] as List? ?? [];
            _propertyCount = _properties.length;
          }

          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryBg,
      appBar: AppBar(
        backgroundColor: AppColors.cardSurface,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        titleSpacing: 20,
        title: Image.asset(
          'assets/images/app_logo.png',
          height: 34,
          fit: BoxFit.contain,
          errorBuilder: (_, __, ___) => const Row(
            children: [
              Icon(Icons.business_center_rounded, color: Color(0xFF009668), size: 24),
              SizedBox(width: 8),
              Text(
                'TheNexopp',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: AppColors.primaryDark),
              ),
            ],
          ),
        ),
        actions: [
          Container(
            height: 44,
            width: 44,
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(
              color: AppColors.cardSurface,
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.subtleBorder),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: IconButton(
              icon: const Icon(Icons.notifications_none_rounded, color: AppColors.primaryDark, size: 22),
              onPressed: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen()));
              },
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: const Color(0xFF009668),
        backgroundColor: AppColors.cardSurface,
        onRefresh: _fetchDashboardData,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: Color(0xFF009668)))
            : SingleChildScrollView(
                physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                padding: const EdgeInsets.fromLTRB(18, 16, 18, 160),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 1. Welcome & Partner Summary Card
                    Container(
                      padding: const EdgeInsets.all(22),
                      decoration: BoxDecoration(
                        color: AppColors.cardSurface,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: AppColors.subtleBorder),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.04),
                            blurRadius: 16,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Welcome back,',
                                    style: GoogleFonts.plusJakartaSans(
                                      color: AppColors.secondaryText,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  const SizedBox(height: 3),
                                  Text(
                                    _agentName,
                                    style: GoogleFonts.plusJakartaSans(
                                      color: AppColors.primaryDark,
                                      fontSize: 24,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: -0.5,
                                    ),
                                  ),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: AppColors.lightSage.withOpacity(0.5),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: AppColors.lightSage),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(
                                      Icons.check_circle_rounded,
                                      color: Color(0xFF009668),
                                      size: 15,
                                    ),
                                    const SizedBox(width: 5),
                                    Text(
                                      'Verified Partner',
                                      style: GoogleFonts.plusJakartaSans(
                                        color: const Color(0xFF007A53),
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 20),
                          const Divider(color: AppColors.subtleBorder, height: 1),
                          const SizedBox(height: 18),
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Total Earnings',
                                      style: GoogleFonts.plusJakartaSans(
                                        color: AppColors.secondaryText,
                                        fontSize: 11,
                                        fontWeight: FontWeight.w500,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 4),
                                    FittedBox(
                                      fit: BoxFit.scaleDown,
                                      alignment: Alignment.centerLeft,
                                      child: Text(
                                        '₹${_totalEarnings.toStringAsFixed(0)}',
                                        style: GoogleFonts.plusJakartaSans(
                                          color: const Color(0xFF009668),
                                          fontSize: 20,
                                          fontWeight: FontWeight.w800,
                                          letterSpacing: -0.5,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Container(
                                height: 34,
                                width: 1,
                                color: AppColors.subtleBorder,
                                margin: const EdgeInsets.symmetric(horizontal: 8),
                              ),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Pending Payout',
                                      style: GoogleFonts.plusJakartaSans(
                                        color: AppColors.secondaryText,
                                        fontSize: 11,
                                        fontWeight: FontWeight.w500,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 4),
                                    FittedBox(
                                      fit: BoxFit.scaleDown,
                                      alignment: Alignment.centerLeft,
                                      child: Text(
                                        '₹${_pendingEarnings.toStringAsFixed(0)}',
                                        style: GoogleFonts.plusJakartaSans(
                                          color: const Color(0xFFE67E22),
                                          fontSize: 20,
                                          fontWeight: FontWeight.w800,
                                          letterSpacing: -0.3,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Container(
                                height: 34,
                                width: 1,
                                color: AppColors.subtleBorder,
                                margin: const EdgeInsets.symmetric(horizontal: 8),
                              ),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Listings',
                                      style: GoogleFonts.plusJakartaSans(
                                        color: AppColors.secondaryText,
                                        fontSize: 11,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    FittedBox(
                                      fit: BoxFit.scaleDown,
                                      alignment: Alignment.centerLeft,
                                      child: Text(
                                        '$_propertyCount Active',
                                        style: GoogleFonts.plusJakartaSans(
                                          color: AppColors.primaryDark,
                                          fontSize: 17,
                                          fontWeight: FontWeight.w800,
                                          letterSpacing: -0.3,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // 2. Add Property / Business Listing CTA Button (White Box with Green Outline)
                    SizedBox(
                      width: double.infinity,
                      height: 54,
                      child: OutlinedButton(
                        onPressed: () => context.push('/properties/add'),
                        style: OutlinedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: const Color(0xFF009668),
                          side: const BorderSide(color: Color(0xFF009668), width: 1.6),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          elevation: 0,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.add_business_rounded, size: 20, color: Color(0xFF009668)),
                            const SizedBox(width: 8),
                            Text(
                              '+ Add Property / Business Listing',
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF009668),
                                letterSpacing: -0.2,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 22),

                    // 3. Agent Tools & Shortcuts
                    Text(
                      'Agent Tools & Shortcuts',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primaryDark,
                        letterSpacing: -0.3,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: _buildQuickActionCard(
                            title: 'Submit Listing',
                            subtitle: 'Add new property',
                            icon: Icons.add_home_work_rounded,
                            iconColor: const Color(0xFF009668),
                            onTap: () => context.push('/properties/add'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildQuickActionCard(
                            title: 'My Listings',
                            subtitle: '$_propertyCount properties',
                            icon: Icons.domain_rounded,
                            iconColor: AppColors.primaryDark,
                            onTap: () {
                              HapticFeedback.selectionClick();
                              ref.read(bottomNavIndexProvider.notifier).state = 1;
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: _buildQuickActionCard(
                            title: 'Earnings & Payouts',
                            subtitle: 'Track bank deposits',
                            icon: Icons.account_balance_wallet_rounded,
                            iconColor: const Color(0xFFC4883A),
                            onTap: () {
                              HapticFeedback.selectionClick();
                              ref.read(bottomNavIndexProvider.notifier).state = 2;
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildQuickActionCard(
                            title: 'Partner Helpdesk',
                            subtitle: 'Direct agent support',
                            icon: Icons.headset_mic_rounded,
                            iconColor: const Color(0xFF009668),
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const SupportScreen()),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 22),

                    // 4. My Recent Submissions Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'My Recent Submissions',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: AppColors.primaryDark,
                            letterSpacing: -0.3,
                          ),
                        ),
                        GestureDetector(
                          onTap: () {
                            HapticFeedback.selectionClick();
                            ref.read(bottomNavIndexProvider.notifier).state = 1;
                          },
                          child: Text(
                            'View all ($_propertyCount)',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF009668),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // 5. Properties List
                    if (_properties.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: AppColors.cardSurface,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppColors.subtleBorder),
                        ),
                        child: Center(
                          child: Text(
                            'No properties submitted yet. Tap "+ Add Property" above.',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 13,
                              color: AppColors.secondaryText,
                            ),
                          ),
                        ),
                      )
                    else
                      ..._properties.take(3).map((prop) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: _buildAgentPropertyCard(prop),
                        );
                      }),
                    const SizedBox(height: 16),

                    // 6. Instant Payout Settlement Banner
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.cardSurface,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: AppColors.subtleBorder),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppColors.lightSage.withOpacity(0.5),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.bolt_rounded, color: Color(0xFF009668), size: 20),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Instant Payout Settlement',
                                  style: GoogleFonts.plusJakartaSans(
                                    color: AppColors.primaryDark,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 13,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Approved property commissions are credited directly to your bank account / UPI.',
                                  style: GoogleFonts.plusJakartaSans(
                                    color: AppColors.secondaryText,
                                    fontSize: 11,
                                    height: 1.3,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // 7. Agent Support & Helpdesk Card
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.cardSurface,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: AppColors.subtleBorder),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.03),
                            blurRadius: 10,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppColors.secondaryBg,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.headset_mic_rounded, color: AppColors.primaryDark, size: 22),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Need Help or Face an Issue?',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 13,
                                    color: AppColors.primaryDark,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Direct partner desk & ticket filing',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 11,
                                    color: AppColors.secondaryText,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          ElevatedButton(
                            onPressed: () {
                              Navigator.push(context, MaterialPageRoute(builder: (_) => const SupportScreen()));
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primaryDark,
                              foregroundColor: Colors.white,
                              shape: const StadiumBorder(),
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              minimumSize: Size.zero,
                              elevation: 0,
                            ),
                            child: Text(
                              'Support',
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
      ),
    );
  }

  // --- Agent Submitted Property Card ---
  Widget _buildAgentPropertyCard(dynamic prop) {
    final images = prop['images'] as List? ?? [];
    final imageUrl = images.isNotEmpty ? images.first['url'] : null;
    final status = (prop['status'] ?? 'SUBMITTED').toString().toUpperCase();
    final category = prop['category']?.toString().replaceAll('_', ' ') ?? 'Property';

    Color statusBg = AppColors.secondaryBg;
    Color statusText = AppColors.secondaryText;
    Color statusBorder = AppColors.subtleBorder;
    IconData statusIcon = Icons.access_time_rounded;

    if (status == 'APPROVED') {
      statusBg = AppColors.lightSage.withOpacity(0.5);
      statusText = const Color(0xFF007A53);
      statusBorder = AppColors.lightSage;
      statusIcon = Icons.check_circle_rounded;
    } else if (status == 'REJECTED') {
      statusBg = const Color(0xFFFAECEB);
      statusText = const Color(0xFF8F3329);
      statusBorder = const Color(0xFFE8BFBA);
      statusIcon = Icons.cancel_rounded;
    } else if (status == 'UNDER_REVIEW' || status == 'SUBMITTED') {
      statusBg = const Color(0xFFF5EFE0);
      statusText = const Color(0xFF7A6025);
      statusBorder = const Color(0xFFE6D8B8);
      statusIcon = Icons.schedule_rounded;
    }

    return GestureDetector(
      onTap: () => context.push('/properties/${prop['id']}'),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.cardSurface,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.subtleBorder),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            // Property Thumbnail
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Container(
                height: 72,
                width: 72,
                color: AppColors.secondaryBg,
                child: imageUrl != null
                    ? Image.network(
                        imageUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const Center(
                          child: Icon(Icons.apartment_rounded, color: AppColors.secondaryText, size: 28),
                        ),
                      )
                    : const Center(
                        child: Icon(Icons.apartment_rounded, color: AppColors.secondaryText, size: 28),
                      ),
              ),
            ),
            const SizedBox(width: 12),
            // Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          prop['title'] ?? 'Listing Submission',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primaryDark,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 6),
                      // Status Badge
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: statusBg,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: statusBorder),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(statusIcon, size: 10, color: statusText),
                            const SizedBox(width: 3),
                            Text(
                              status,
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 9.5,
                                fontWeight: FontWeight.w800,
                                color: statusText,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined, size: 12, color: AppColors.secondaryText),
                      const SizedBox(width: 2),
                      Expanded(
                        child: Text(
                          prop['location'] ?? 'India',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w500,
                            color: AppColors.secondaryText,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        category,
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppColors.secondaryText,
                        ),
                      ),
                      Text(
                        '₹${prop['price'] ?? 0}',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primaryDark,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActionCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color iconColor,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        onTap();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.cardSurface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.subtleBorder),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: iconColor.withOpacity(0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: iconColor, size: 18),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primaryDark,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 1),
                  Text(
                    subtitle,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                      color: AppColors.secondaryText,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
