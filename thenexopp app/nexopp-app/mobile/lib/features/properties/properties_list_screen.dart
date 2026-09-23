import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/api_constants.dart';
import '../../core/widgets/animated_spring_button.dart';
import '../../core/widgets/state_widgets.dart';
import '../../shared/providers/dio_provider.dart';

import '../../core/widgets/app_network_image.dart';

class PropertiesListScreen extends ConsumerStatefulWidget {
  const PropertiesListScreen({super.key});

  @override
  ConsumerState<PropertiesListScreen> createState() => _PropertiesListScreenState();
}

class _PropertiesListScreenState extends ConsumerState<PropertiesListScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  List<dynamic> _properties = [];
  String _selectedStatus = 'ALL';
  String _searchQuery = '';

  final List<String> _statuses = ['ALL', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'];

  @override
  void initState() {
    super.initState();
    _fetchProperties();
  }

  Future<void> _fetchProperties() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final dio = ref.read(dioClientProvider).dio;
      final statusParam = _selectedStatus == 'ALL' ? '' : '?status=$_selectedStatus';
      final response = await dio.get('${ApiConstants.properties}$statusParam');

      if (mounted) {
        setState(() {
          _properties = response.data['data'] ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Failed to load property listings';
          _isLoading = false;
        });
      }
    }
  }

  List<dynamic> get _filteredList {
    if (_searchQuery.isEmpty) return _properties;
    return _properties.where((p) {
      final title = (p['title'] ?? '').toString().toLowerCase();
      final loc = (p['location'] ?? '').toString().toLowerCase();
      final cat = (p['category'] ?? '').toString().toLowerCase();
      final q = _searchQuery.toLowerCase();
      return title.contains(q) || loc.contains(q) || cat.contains(q);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryBg,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // Top Header: Title + Add Button
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'My Listings',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primaryDark,
                      letterSpacing: -0.5,
                    ),
                  ),
                  GestureDetector(
                    onTap: () {
                      HapticFeedback.selectionClick();
                      context.push('/properties/add');
                    },
                    child: Container(
                      height: 42,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: AppColors.primaryDark,
                        borderRadius: BorderRadius.circular(21),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primaryDark.withOpacity(0.2),
                            blurRadius: 10,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.add_rounded, color: Colors.white, size: 18),
                          const SizedBox(width: 4),
                          Text(
                            'Add',
                            style: GoogleFonts.plusJakartaSans(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Search Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
              child: PremiumSearchBar(
                hintText: 'Search my listings...',
                onChanged: (val) => setState(() => _searchQuery = val),
              ),
            ),

            // Status Filter Chips
            SizedBox(
              height: 56,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                itemCount: _statuses.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final st = _statuses[index];
                  final label = st == 'ALL'
                      ? 'All'
                      : st == 'SUBMITTED'
                          ? 'Under Review'
                          : st[0] + st.substring(1).toLowerCase();
                  final isSelected = _selectedStatus == st;
                  return CategoryChipPill(
                    label: label,
                    isSelected: isSelected,
                    onTap: () {
                      setState(() => _selectedStatus = st);
                      _fetchProperties();
                    },
                  );
                },
              ),
            ),

            // Listings Content
            Expanded(
              child: RefreshIndicator(
                color: AppColors.primaryDark,
                backgroundColor: AppColors.cardSurface,
                onRefresh: _fetchProperties,
                child: _isLoading
                    ? const LoadingSkeletonList()
                    : _errorMessage != null
                        ? ErrorStateWidget(message: _errorMessage!, onRetry: _fetchProperties)
                        : _filteredList.isEmpty
                            ? EmptyStateWidget(
                                title: 'No Properties Found',
                                message: 'You have no listings under the $_selectedStatus filter.',
                                buttonText: '+ Add New Property',
                                onAction: () => context.push('/properties/add'),
                              )
                            : ListView.builder(
                                physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                                padding: const EdgeInsets.fromLTRB(20, 10, 20, 100),
                                itemCount: _filteredList.length,
                                itemBuilder: (context, index) {
                                  final prop = _filteredList[index];
                                  return Padding(
                                    padding: const EdgeInsets.only(bottom: 16),
                                    child: AnimatedCard(
                                      index: index,
                                      child: _buildPropertyCard(prop),
                                    ),
                                  );
                                },
                              ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPropertyCard(dynamic prop) {
    final images = prop['images'] as List? ?? [];

    Map<String, dynamic> specs = {};
    if (prop['specifications'] != null) {
      if (prop['specifications'] is Map) {
        specs = Map<String, dynamic>.from(prop['specifications']);
      } else if (prop['specifications'] is String) {
        try {
          specs = jsonDecode(prop['specifications']);
        } catch (_) {}
      }
    }

    final bhk = specs['bhk'] ?? specs['commercialType'];
    final area = specs['areaSqFt'];

    return GestureDetector(
      onTap: () => context.push('/properties/${prop['id']}'),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.cardSurface,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: AppColors.subtleBorder),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 14,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              // Property Thumbnail with Radius
              AppNetworkImage(
                imageSource: images.isNotEmpty ? images.first : null,
                width: 96,
                height: 96,
                borderRadius: BorderRadius.circular(16),
                fallbackIconSize: 32,
              ),
              const SizedBox(width: 14),

              // Property Information
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
                            prop['title'] ?? 'Listing',
                            style: GoogleFonts.plusJakartaSans(
                              fontWeight: FontWeight.w700,
                              fontSize: 15,
                              color: AppColors.primaryDark,
                              letterSpacing: -0.2,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 6),
                        _buildStatusBadge(prop['status'] ?? 'DRAFT'),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined, size: 12, color: AppColors.secondaryText),
                        const SizedBox(width: 3),
                        Expanded(
                          child: Text(
                            prop['location'] ?? 'India',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 12,
                              color: AppColors.secondaryText,
                              fontWeight: FontWeight.w500,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    if (bhk != null || area != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        bhk != null ? '$bhk' : '${area} sq ft',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppColors.mutedSage,
                          height: 1.25,
                        ),
                        maxLines: 2,
                        softWrap: true,
                      ),
                    ],
                    const SizedBox(height: 6),
                    Text(
                      '₹${prop['price']}',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primaryDark,
                        letterSpacing: -0.3,
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

  Widget _buildStatusBadge(String status) {
    Color bg = AppColors.secondaryBg;
    Color text = AppColors.secondaryText;
    Color border = AppColors.subtleBorder;

    if (status == 'APPROVED') {
      bg = AppColors.lightSage.withOpacity(0.5);
      text = AppColors.mutedSage;
      border = AppColors.lightSage;
    } else if (status == 'SUBMITTED') {
      bg = const Color(0xFFFDF6EC);
      text = const Color(0xFFC4883A);
      border = const Color(0xFFF3E2C7);
    } else if (status == 'REJECTED') {
      bg = const Color(0xFFFDF2F2);
      text = AppColors.statusError;
      border = const Color(0xFFF8D7DA);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: border),
      ),
      child: Text(
        status == 'SUBMITTED' ? 'REVIEW' : status,
        style: GoogleFonts.plusJakartaSans(
          fontSize: 9,
          fontWeight: FontWeight.w800,
          color: text,
          letterSpacing: 0.3,
        ),
      ),
    );
  }
}

