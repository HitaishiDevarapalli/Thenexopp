import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/api_constants.dart';
import '../../core/widgets/animated_spring_button.dart';
import '../../core/widgets/app_network_image.dart';
import '../../shared/providers/dio_provider.dart';

class PropertyDetailsScreen extends ConsumerStatefulWidget {
  final String propertyId;
  const PropertyDetailsScreen({super.key, required this.propertyId});

  @override
  ConsumerState<PropertyDetailsScreen> createState() => _PropertyDetailsScreenState();
}

class _PropertyDetailsScreenState extends ConsumerState<PropertyDetailsScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _property;
  int _activeImageIndex = 0;

  @override
  void initState() {
    super.initState();
    _fetchDetails();
  }

  Future<void> _fetchDetails() async {
    try {
      final dio = ref.read(dioClientProvider).dio;
      final res = await dio.get('${ApiConstants.properties}/${widget.propertyId}');
      if (mounted && res.data['success'] == true) {
        setState(() {
          _property = res.data['data'];
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _formatDateTime(dynamic dt) {
    if (dt == null) return 'N/A';
    try {
      final date = dt is DateTime ? dt : DateTime.parse(dt.toString()).toLocal();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      final day = date.day.toString().padLeft(2, '0');
      final month = months[date.month - 1];
      final year = date.year;
      final hourInt = date.hour % 12 == 0 ? 12 : date.hour % 12;
      final hour = hourInt.toString().padLeft(2, '0');
      final minute = date.minute.toString().padLeft(2, '0');
      final ampm = date.hour >= 12 ? 'PM' : 'AM';
      return '$day $month $year, $hour:$minute $ampm';
    } catch (_) {
      return dt.toString();
    }
  }

  @override
  Widget build(BuildContext context) {
    final images = _property?['images'] as List? ?? [];
    final category = _property?['category']?.toString() ?? 'RESIDENTIAL_RENT';
    final status = _property?['status']?.toString() ?? 'DRAFT';

    Map<String, dynamic> specs = {};
    if (_property?['specifications'] != null) {
      if (_property!['specifications'] is Map) {
        specs = Map<String, dynamic>.from(_property!['specifications']);
      } else if (_property!['specifications'] is String) {
        try {
          specs = jsonDecode(_property!['specifications']);
        } catch (_) {}
      }
    }

    final bhk = specs['bhk'] ?? specs['commercialType'];
    final furnishing = specs['furnishing'];
    final area = specs['areaSqFt'];
    final deposit = specs['deposit'];

    return Scaffold(
      backgroundColor: AppColors.primaryBg,
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: AppColors.primaryDark))
            : _property == null
                ? Center(
                    child: Text(
                      'Listing details could not be found',
                      style: GoogleFonts.plusJakartaSans(color: AppColors.secondaryText),
                    ),
                  )
                : SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // 1. Top Header matching Screen 3: Back Button + Title + Favorite Button
                        Padding(
                          padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              GestureDetector(
                                onTap: () => Navigator.pop(context),
                                child: Container(
                                  width: 44,
                                  height: 44,
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
                                  child: const Icon(
                                    Icons.arrow_back_ios_new_rounded,
                                    color: AppColors.primaryDark,
                                    size: 16,
                                  ),
                                ),
                              ),
                              Text(
                                'Property Detail',
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.primaryDark,
                                  letterSpacing: -0.3,
                                ),
                              ),
                              const AnimatedFavoriteButton(size: 44),
                            ],
                          ),
                        ),

                        // 2. Photos Carousel with Rounded Edges (Screen 3 Reference)
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                          child: Stack(
                            alignment: Alignment.bottomCenter,
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(24),
                                child: Container(
                                  height: 240,
                                  width: double.infinity,
                                  color: AppColors.secondaryBg,
                                  child: images.isNotEmpty
                                      ? PageView.builder(
                                          itemCount: images.length,
                                          onPageChanged: (idx) => setState(() => _activeImageIndex = idx),
                                          itemBuilder: (context, index) {
                                            return AppNetworkImage(
                                              imageSource: images[index],
                                              width: double.infinity,
                                              height: 240,
                                              fit: BoxFit.cover,
                                              errorWidget: _buildImagePlaceholder(),
                                            );
                                          },
                                        )
                                      : _buildImagePlaceholder(),
                                ),
                              ),
                              // Page Indicator Dots
                              if (images.length > 1)
                                Positioned(
                                  bottom: 12,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                    decoration: BoxDecoration(
                                      color: Colors.black.withOpacity(0.45),
                                      borderRadius: BorderRadius.circular(14),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: List.generate(
                                        images.length,
                                        (i) => Container(
                                          margin: const EdgeInsets.symmetric(horizontal: 3),
                                          width: _activeImageIndex == i ? 16 : 6,
                                          height: 6,
                                          decoration: BoxDecoration(
                                            color: _activeImageIndex == i ? Colors.white : Colors.white.withOpacity(0.4),
                                            borderRadius: BorderRadius.circular(3),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),

                        // 3. Title & Price Row (Screen 3 Reference)
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      _property!['title'] ?? 'Listing Details',
                                      style: GoogleFonts.plusJakartaSans(
                                        fontSize: 22,
                                        fontWeight: FontWeight.w800,
                                        color: AppColors.primaryDark,
                                        letterSpacing: -0.4,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        const Icon(Icons.location_on_outlined, size: 15, color: AppColors.secondaryText),
                                        const SizedBox(width: 4),
                                        Expanded(
                                          child: Text(
                                            _property!['location'] ?? 'Location N/A',
                                            style: GoogleFonts.plusJakartaSans(
                                              color: AppColors.secondaryText,
                                              fontSize: 13,
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 5),
                                    Row(
                                      children: [
                                        const Icon(Icons.schedule_rounded, size: 13, color: AppColors.secondaryText),
                                        const SizedBox(width: 4),
                                        Expanded(
                                          child: Text(
                                            'Added: ${_formatDateTime(_property!['createdAt'])}',
                                            style: GoogleFonts.plusJakartaSans(
                                              color: AppColors.secondaryText,
                                              fontSize: 11.5,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    '₹${_property!['price']}',
                                    style: GoogleFonts.plusJakartaSans(
                                      fontSize: 22,
                                      fontWeight: FontWeight.w900,
                                      color: AppColors.primaryDark,
                                      letterSpacing: -0.5,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  _buildStatusBadge(status),
                                  if (status == 'APPROVED' && (_property!['reviewedAt'] != null || _property!['updatedAt'] != null)) ...[
                                    const SizedBox(height: 4),
                                    Text(
                                      'Approved: ${_formatDateTime(_property!['reviewedAt'] ?? _property!['updatedAt'])}',
                                      style: GoogleFonts.plusJakartaSans(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w700,
                                        color: const Color(0xFF007A53),
                                      ),
                                      textAlign: TextAlign.end,
                                    ),
                                  ],
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),

                        // 4. Feature Specification Micro-Cards Grid
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: Row(
                            children: [
                              Expanded(
                                child: _buildSpecCard(
                                  Icons.bed_rounded,
                                  bhk != null ? bhk.toString() : 'N/A',
                                  'Config',
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: _buildSpecCard(
                                  Icons.chair_rounded,
                                  furnishing != null ? furnishing.toString().split(' ').first : 'Standard',
                                  'Furnishing',
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: _buildSpecCard(
                                  Icons.square_foot_rounded,
                                  area != null && area.toString().isNotEmpty ? '$area' : 'N/A',
                                  'Sq Ft',
                                ),
                              ),
                              if (deposit != null && deposit.toString().isNotEmpty) ...[
                                const SizedBox(width: 10),
                                Expanded(
                                  child: _buildSpecCard(
                                    Icons.lock_clock_rounded,
                                    '₹$deposit',
                                    'Deposit',
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),

                        // 5. Listing Agent / Partner Card
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: AppColors.cardSurface,
                              borderRadius: BorderRadius.circular(22),
                              border: Border.all(color: AppColors.subtleBorder),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.03),
                                  blurRadius: 12,
                                  offset: const Offset(0, 3),
                                ),
                              ],
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 48,
                                  height: 48,
                                  decoration: const BoxDecoration(
                                    color: AppColors.secondaryBg,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Center(
                                    child: Icon(Icons.person_rounded, color: AppColors.primaryDark, size: 24),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'TheNexopp Agent',
                                        style: GoogleFonts.plusJakartaSans(
                                          fontWeight: FontWeight.w700,
                                          fontSize: 14,
                                          color: AppColors.primaryDark,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        'Verified Network Partner',
                                        style: GoogleFonts.plusJakartaSans(
                                          color: AppColors.secondaryText,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                ElevatedButton(
                                  onPressed: () async {
                                    final uri = Uri.parse('tel:+918977505204');
                                    try {
                                      await launchUrl(uri, mode: LaunchMode.externalApplication);
                                    } catch (_) {}
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.primaryDark,
                                    foregroundColor: Colors.white,
                                    shape: const StadiumBorder(),
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                    minimumSize: Size.zero,
                                  ),
                                  child: Text(
                                    'Contact Now',
                                    style: GoogleFonts.plusJakartaSans(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),

                        // 6. Description Section
                        if (_property!['description'] != null && _property!['description'].toString().isNotEmpty) ...[
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Overview',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.primaryDark,
                                    letterSpacing: -0.3,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  _property!['description'],
                                  style: GoogleFonts.plusJakartaSans(
                                    color: AppColors.secondaryText,
                                    fontSize: 14,
                                    height: 1.5,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 20),
                        ],

                        // 7. Specifications Detail Table
                        if (specs.isNotEmpty) ...[
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Specifications & Features',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.primaryDark,
                                    letterSpacing: -0.3,
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Container(
                                  padding: const EdgeInsets.all(18),
                                  decoration: BoxDecoration(
                                    color: AppColors.cardSurface,
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(color: AppColors.subtleBorder),
                                  ),
                                  child: _buildDynamicSpecsView(category, specs),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 20),
                        ],

                        // 8. Listing Timings & Review Activity Card (at the bottom)
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: _buildTimingsCard(_property!, status),
                        ),
                        const SizedBox(height: 20),

                        // 9. Submit Draft Button if DRAFT
                        if (_property!['status'] == 'DRAFT') ...[
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 20),
                            child: AnimatedSpringButton(
                              text: 'Submit Listing for Review',
                              icon: Icons.send_rounded,
                              onPressed: () async {
                                final dio = ref.read(dioClientProvider).dio;
                                await dio.post(ApiConstants.submitProperty(widget.propertyId));
                                _fetchDetails();
                              },
                            ),
                          ),
                          const SizedBox(height: 20),
                        ],

                        const SizedBox(height: 60),
                      ],
                    ),
                  ),
      ),
    );
  }

  Widget _buildTimingsCard(Map<String, dynamic> property, String status) {
    final createdAt = property['createdAt'];
    final submittedAt = property['submittedAt'];
    final reviewedAt = property['reviewedAt'];
    final updatedAt = property['updatedAt'];

    final isApproved = status == 'APPROVED';
    final isRejected = status == 'REJECTED';
    final isSubmitted = status == 'SUBMITTED' || isApproved || isRejected;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.cardSurface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.subtleBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppColors.secondaryBg,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.history_toggle_off_rounded,
                  size: 18,
                  color: AppColors.primaryDark,
                ),
              ),
              const SizedBox(width: 10),
              Text(
                'Listing Timings & Activity',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primaryDark,
                  letterSpacing: -0.2,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Divider(height: 1, color: AppColors.subtleBorder),
          const SizedBox(height: 14),

          // 1. Added Date & Time
          _buildTimingRow(
            title: 'Added / Created On',
            dateTimeStr: _formatDateTime(createdAt),
            icon: Icons.add_circle_outline_rounded,
            iconColor: const Color(0xFF009668),
            statusTag: 'Created by Agent',
            statusTagColor: const Color(0xFF009668),
          ),
          const SizedBox(height: 14),

          // 2. Submitted for Review Date & Time
          _buildTimingRow(
            title: 'Submitted for Review',
            dateTimeStr: submittedAt != null
                ? _formatDateTime(submittedAt)
                : (isSubmitted ? _formatDateTime(createdAt) : 'Draft stage (Not submitted)'),
            icon: Icons.send_rounded,
            iconColor: isSubmitted ? const Color(0xFF2563EB) : AppColors.secondaryText,
            statusTag: isSubmitted ? 'Sent to Admin' : 'Pending Action',
            statusTagColor: isSubmitted ? const Color(0xFF2563EB) : AppColors.secondaryText,
          ),
          const SizedBox(height: 14),

          // 3. Admin Approval / Review Date & Time
          _buildTimingRow(
            title: isApproved
                ? 'Admin Approved On'
                : (isRejected ? 'Admin Reviewed (Rejected)' : 'Admin Review Status'),
            dateTimeStr: reviewedAt != null
                ? _formatDateTime(reviewedAt)
                : (isApproved
                    ? _formatDateTime(updatedAt ?? createdAt)
                    : (isSubmitted ? 'Under Review (Pending Approval)' : 'Awaiting Submission')),
            icon: isApproved
                ? Icons.check_circle_rounded
                : (isRejected ? Icons.cancel_rounded : Icons.hourglass_top_rounded),
            iconColor: isApproved
                ? const Color(0xFF009668)
                : (isRejected ? const Color(0xFFDC2626) : const Color(0xFFD97706)),
            statusTag: isApproved
                ? 'Approved & Live'
                : (isRejected ? 'Action Required' : 'Awaiting Approval'),
            statusTagColor: isApproved
                ? const Color(0xFF009668)
                : (isRejected ? const Color(0xFFDC2626) : const Color(0xFFD97706)),
          ),

          if (updatedAt != null && updatedAt != createdAt) ...[
            const SizedBox(height: 14),
            _buildTimingRow(
              title: 'Last Modified',
              dateTimeStr: _formatDateTime(updatedAt),
              icon: Icons.update_rounded,
              iconColor: AppColors.secondaryText,
              statusTag: 'Updated',
              statusTagColor: AppColors.secondaryText,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTimingRow({
    required String title,
    required String dateTimeStr,
    required IconData icon,
    required Color iconColor,
    required String statusTag,
    required Color statusTagColor,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          margin: const EdgeInsets.only(top: 2),
          padding: const EdgeInsets.all(5),
          decoration: BoxDecoration(
            color: iconColor.withOpacity(0.12),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, size: 14, color: iconColor),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primaryDark,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: statusTagColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      statusTag,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 9.5,
                        fontWeight: FontWeight.w700,
                        color: statusTagColor,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 3),
              Text(
                dateTimeStr,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.secondaryText,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildImagePlaceholder() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.apartment_rounded, size: 48, color: AppColors.secondaryText.withOpacity(0.4)),
          const SizedBox(height: 6),
          Text(
            'TheNexopp Listing',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.secondaryText.withOpacity(0.6),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSpecCard(IconData icon, String value, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 6),
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
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 20, color: AppColors.mutedSage),
          const SizedBox(height: 6),
          Text(
            value,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: AppColors.primaryDark,
              height: 1.2,
            ),
            maxLines: 2,
            textAlign: TextAlign.center,
            softWrap: true,
          ),
          const SizedBox(height: 3),
          Text(
            label,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 10,
              fontWeight: FontWeight.w500,
              color: AppColors.secondaryText,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDynamicSpecsView(String category, Map<String, dynamic> specs) {
    final List<Widget> items = [];

    specs.forEach((key, val) {
      if (val == null || val.toString().isEmpty) return;
      if (key == 'amenities' || key == 'includedAssets') {
        final list = val is List ? val : [];
        if (list.isNotEmpty) {
          items.add(
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    key == 'amenities' ? 'Amenities' : 'Included Assets',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primaryDark,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: list.map((item) {
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.secondaryBg,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.subtleBorder),
                        ),
                        child: Text(
                          item.toString(),
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primaryDark,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
          );
        }
      } else {
        items.add(
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  flex: 5,
                  child: Text(
                    _formatSpecKey(key),
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 12,
                      color: AppColors.secondaryText,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  flex: 6,
                  child: Text(
                    val.toString(),
                    textAlign: TextAlign.end,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primaryDark,
                      height: 1.3,
                    ),
                    maxLines: 3,
                    softWrap: true,
                  ),
                ),
              ],
            ),
          ),
        );
      }
    });

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: items,
    );
  }

  String _formatSpecKey(String key) {
    switch (key) {
      case 'bhk':
        return 'Configuration';
      case 'furnishing':
        return 'Furnishing Status';
      case 'deposit':
        return 'Security Deposit';
      case 'areaSqFt':
        return 'Super Area (sq.ft)';
      case 'carpetAreaSqFt':
        return 'Carpet Area';
      case 'tenantPreference':
        return 'Preferred Tenants';
      case 'propertyType':
        return 'Property Type';
      case 'possession':
        return 'Possession Status';
      case 'ownership':
        return 'Ownership Khata';
      case 'commercialType':
        return 'Commercial Space Type';
      case 'lockInPeriod':
        return 'Lock-in Period';
      case 'seats':
        return 'Seating Capacity';
      case 'sector':
        return 'Industry Sector';
      case 'dealType':
        return 'Deal / Transfer Type';
      case 'monthlyRevenue':
        return 'Monthly Revenue';
      case 'monthlyProfit':
        return 'Monthly Net Profit';
      case 'establishedYear':
        return 'Inception Year';
      case 'employees':
        return 'Employees';
      default:
        return key.replaceAllMapped(RegExp(r'([A-Z])'), (m) => ' ${m[1]}').capitalize();
    }
  }

  Widget _buildStatusBadge(String status) {
    Color color = AppColors.mutedSage;
    Color bg = AppColors.lightSage.withOpacity(0.5);

    if (status == 'APPROVED') {
      color = AppColors.mutedSage;
      bg = AppColors.lightSage.withOpacity(0.5);
    } else if (status == 'REJECTED') {
      color = AppColors.statusError;
      bg = const Color(0xFFFFF1F2);
    } else if (status == 'SUBMITTED') {
      color = const Color(0xFFC4883A);
      bg = const Color(0xFFFDF6EC);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status,
        style: GoogleFonts.plusJakartaSans(
          fontSize: 10,
          fontWeight: FontWeight.w800,
          color: color,
        ),
      ),
    );
  }
}

extension StringExtension on String {
  String capitalize() {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1)}';
  }
}
