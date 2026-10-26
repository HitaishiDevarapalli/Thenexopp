import '../../core/widgets/partner_ui.dart';
import 'package:flutter/material.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';


import '../../core/constants/api_constants.dart';
import '../../core/widgets/animated_spring_button.dart';
import '../../core/widgets/state_widgets.dart';
import '../../shared/providers/dio_provider.dart';

class PropertiesListScreen extends ConsumerStatefulWidget {
  const PropertiesListScreen({super.key});

  @override
  ConsumerState<PropertiesListScreen> createState() =>
      _PropertiesListScreenState();
}

class _PropertiesListScreenState extends ConsumerState<PropertiesListScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  List<dynamic> _properties = [];
  String _selectedStatus = 'ALL';
  String _searchQuery = '';

  final List<String> _statuses = [
    'ALL',
    'DRAFT',
    'SUBMITTED',
    'APPROVED',
    'REJECTED'
  ];

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
      final statusParam =
          _selectedStatus == 'ALL' ? '' : '?status=$_selectedStatus';
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
      body: SafeArea(
          bottom: false,
          child: Column(children: [
            Padding(
                padding: const EdgeInsets.fromLTRB(24, 24, 24, 20),
                child: Row(children: [
                  Expanded(
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                        const PartnerEyebrow('Your portfolio'),
                        const SizedBox(height: 8),
                        Text('My listings',
                            style: Theme.of(context).textTheme.headlineMedium),
                        const SizedBox(height: 6),
                        Text('Every opportunity, in one place.',
                            style: Theme.of(context).textTheme.bodySmall),
                      ])),
                  const SizedBox(width: 8),
                  IconButton.filled(
                      tooltip: 'Add a listing',
                      icon: const Icon(Icons.add_rounded),
                      onPressed: () async {
                        await context.push('/properties/add');
                        if (mounted) _fetchProperties();
                      }),
                ])),
            Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: PremiumSearchBar(
                    hintText: 'Search by property or location',
                    onChanged: (val) => setState(() => _searchQuery = val))),
            SizedBox(
                height: 64,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  itemCount: _statuses.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (context, index) {
                    final status = _statuses[index];
                    final label = status == 'ALL'
                        ? 'All listings'
                        : status == 'SUBMITTED'
                            ? 'In review'
                            : status[0] + status.substring(1).toLowerCase();
                    return CategoryChipPill(
                        label: label,
                        isSelected: _selectedStatus == status,
                        onTap: () {
                          setState(() => _selectedStatus = status);
                          _fetchProperties();
                        });
                  },
                )),
            Expanded(
                child: RefreshIndicator(
              onRefresh: _fetchProperties,
              child: _isLoading
                  ? const LoadingSkeletonList()
                  : _errorMessage != null
                      ? ListView(
                          physics: const AlwaysScrollableScrollPhysics(),
                          children: [
                              ErrorStateWidget(
                                  message: _errorMessage!,
                                  onRetry: _fetchProperties)
                            ])
                      : _filteredList.isEmpty
                          ? ListView(
                              physics: const AlwaysScrollableScrollPhysics(),
                              children: [
                                  EmptyStateWidget(
                                      title: _searchQuery.isNotEmpty
                                          ? 'No matching listings'
                                          : 'Make room for opportunity',
                                      message: _searchQuery.isNotEmpty
                                          ? 'Try another property name or location.'
                                          : 'Your ${_selectedStatus == 'ALL' ? '' : _selectedStatus.toLowerCase()} listings will appear here.',
                                      icon: Icons.domain_outlined,
                                      buttonText: _searchQuery.isNotEmpty
                                          ? null
                                          : 'Create a listing',
                                      onAction: () =>
                                          context.push('/properties/add'))
                                ])
                          : ListView.separated(
                              physics: const AlwaysScrollableScrollPhysics(),
                              padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
                              itemCount: _filteredList.length,
                              separatorBuilder: (_, __) =>
                                  const SizedBox(height: 18),
                              itemBuilder: (context, index) {
                                final property = _filteredList[index];
                                return PartnerListingCard(
                                    property:
                                        Map<String, dynamic>.from(property),
                                    onTap: () => context
                                        .push('/properties/${property['id']}'));
                              },
                            ),
            )),
          ])),
    );
  }
}

