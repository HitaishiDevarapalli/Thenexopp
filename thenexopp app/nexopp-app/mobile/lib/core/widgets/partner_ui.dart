import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../theme/app_colors.dart';
import 'app_network_image.dart';

String partnerCurrency(dynamic value) {
  final amount = num.tryParse('$value') ?? 0;
  return NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹',
    decimalDigits: amount % 1 == 0 ? 0 : 2,
  ).format(amount);
}

class PartnerEyebrow extends StatelessWidget {
  const PartnerEyebrow(this.text,
      {super.key, this.color = AppColors.mutedSage});
  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) => Text(text.toUpperCase(),
      style: Theme.of(context).textTheme.labelSmall?.copyWith(
          color: color, fontWeight: FontWeight.w700, letterSpacing: 1.8));
}

class PartnerSection extends StatelessWidget {
  const PartnerSection(this.title, {super.key, this.action, this.onAction});
  final String title;
  final String? action;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(top: 28, bottom: 14),
        child: Row(children: [
          Expanded(
              child:
                  Text(title, style: Theme.of(context).textTheme.titleLarge)),
          if (action != null)
            TextButton(onPressed: onAction, child: Text(action!)),
        ]),
      );
}

class PartnerSurface extends StatelessWidget {
  const PartnerSurface(
      {super.key,
      required this.child,
      this.padding = const EdgeInsets.all(20)});
  final Widget child;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) => Container(
        padding: padding,
        decoration: BoxDecoration(
          color: AppColors.cardSurface,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppColors.subtleBorder),
        ),
        child: child,
      );
}

/// One shared financial hierarchy for the dashboard and earnings screen.
class PartnerBalanceCard extends StatelessWidget {
  const PartnerBalanceCard(
      {super.key,
      required this.amount,
      required this.label,
      required this.metrics,
      this.onTap});
  final String amount;
  final String label;
  final List<({String label, String value})> metrics;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) => Container(
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(28),
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF224D40), Color(0xFF102C26)],
          ),
          boxShadow: const [
            BoxShadow(
                color: Color(0x22224D40), blurRadius: 24, offset: Offset(0, 10))
          ],
        ),
        child: Stack(children: [
          Positioned(
              right: -60,
              top: -90,
              child: Container(
                width: 240,
                height: 240,
                decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                        color: Colors.white.withValues(alpha: .07), width: 40)),
              )),
          Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    Expanded(
                        child: PartnerEyebrow(label,
                            color: const Color(0xFFBDCEC5))),
                    if (onTap != null)
                      IconButton.filledTonal(
                        tooltip: 'View earnings',
                        onPressed: onTap,
                        style: IconButton.styleFrom(
                            backgroundColor:
                                Colors.white.withValues(alpha: .12),
                            foregroundColor: Colors.white),
                        icon: const Icon(Icons.north_east_rounded, size: 20),
                      )
                    else
                      const Icon(Icons.account_balance_wallet_outlined,
                          color: Color(0xFFD2BC8E)),
                  ]),
                  const SizedBox(height: 12),
                  Text(amount,
                      style: Theme.of(context)
                          .textTheme
                          .displayMedium
                          ?.copyWith(
                              color: Colors.white,
                              fontSize: 38,
                              letterSpacing: -1.5)),
                  const SizedBox(height: 6),
                  const Text('Your work. Your growing possibilities.',
                      style: TextStyle(
                          color: Color(0xFFBDCEC5), fontSize: 12, height: 1.5)),
                  const SizedBox(height: 24),
                  const Divider(color: Color(0xFF456258), height: 1),
                  const SizedBox(height: 18),
                  LayoutBuilder(
                      builder: (context, constraints) => Wrap(
                            spacing: 12,
                            runSpacing: 16,
                            children: metrics
                                .map((metric) => SizedBox(
                                      width: metrics.length > 2 &&
                                              constraints.maxWidth < 320
                                          ? (constraints.maxWidth - 12) / 2
                                          : (constraints.maxWidth -
                                                  12 * (metrics.length - 1)) /
                                              metrics.length,
                                      child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(metric.label,
                                                style: const TextStyle(
                                                    color: Color(0xFFBDCEC5),
                                                    fontSize: 11)),
                                            const SizedBox(height: 6),
                                            Text(metric.value,
                                                style: const TextStyle(
                                                    color: Colors.white,
                                                    fontSize: 17,
                                                    fontWeight:
                                                        FontWeight.w600)),
                                          ]),
                                    ))
                                .toList(),
                          )),
                ],
              )),
        ]),
      );
}

class PartnerStatus extends StatelessWidget {
  const PartnerStatus(this.status, {super.key});
  final String status;

  @override
  Widget build(BuildContext context) {
    final normalized = status.toUpperCase();
    final approved = ['APPROVED', 'VERIFIED', 'PAID'].contains(normalized);
    final rejected = ['REJECTED', 'SUSPENDED'].contains(normalized);
    final label = switch (normalized) {
      'SUBMITTED' || 'UNDER_REVIEW' => 'In review',
      'PENDING_APPROVAL' => 'Pending approval',
      _ => normalized.isEmpty
          ? 'Pending'
          : normalized[0] +
              normalized.substring(1).toLowerCase().replaceAll('_', ' '),
    };
    final color = approved
        ? AppColors.primaryEmeraldDark
        : rejected
            ? AppColors.statusError
            : const Color(0xFF866328);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
          color: color.withValues(alpha: .08),
          borderRadius: BorderRadius.circular(8)),
      child: Text(label,
          style: TextStyle(
              color: color, fontSize: 11, fontWeight: FontWeight.w600)),
    );
  }
}

class PartnerListingCard extends StatelessWidget {
  const PartnerListingCard(
      {super.key,
      required this.property,
      required this.onTap,
      this.compact = false});
  final Map<String, dynamic> property;
  final VoidCallback onTap;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final images = property['images'] as List? ?? [];
    final title = '${property['title'] ?? 'Untitled listing'}';
    final rawSpecs = property['specifications'];
    Map<String, dynamic> specs = {};
    if (rawSpecs is Map) {
      specs = Map<String, dynamic>.from(rawSpecs);
    } else if (rawSpecs is String) {
      try {
        final decoded = jsonDecode(rawSpecs);
        if (decoded is Map) specs = Map<String, dynamic>.from(decoded);
      } on FormatException {
        // Listings with older free-text specifications still remain visible.
      }
    }
    final metadata = [
      specs['bhk'] ?? specs['commercialType'],
      if (specs['areaSqFt'] != null) '${specs['areaSqFt']} sq ft',
    ].where((value) => value != null && '$value'.isNotEmpty).join(' · ');
    final details =
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(title,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: Theme.of(context).textTheme.titleMedium),
      const SizedBox(height: 6),
      Row(children: [
        const Icon(Icons.location_on_outlined,
            size: 14, color: AppColors.secondaryText),
        const SizedBox(width: 4),
        Expanded(
            child: Text('${property['location'] ?? 'Location not added'}',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodySmall)),
      ]),
      if (metadata.isNotEmpty) ...[
        const SizedBox(height: 8),
        Text(metadata,
            style: Theme.of(context).textTheme.bodySmall,
            maxLines: 2,
            overflow: TextOverflow.ellipsis),
      ],
      const SizedBox(height: 12),
      Wrap(
          spacing: 12,
          runSpacing: 8,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            Text(partnerCurrency(property['price']),
                style: Theme.of(context).textTheme.titleMedium),
            PartnerStatus('${property['status'] ?? 'DRAFT'}'),
          ]),
    ]);
    return Material(
      color: AppColors.cardSurface,
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: const BorderSide(color: AppColors.subtleBorder)),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
          onTap: onTap,
          child: compact
              ? Padding(
                  padding: const EdgeInsets.all(14),
                  child: Row(children: [
                    AppNetworkImage(
                        imageSource: images.isEmpty ? null : images.first,
                        width: 80,
                        height: 100,
                        borderRadius: BorderRadius.circular(16)),
                    const SizedBox(width: 14),
                    Expanded(child: details),
                  ]))
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                      Stack(children: [
                        AppNetworkImage(
                            imageSource: images.isEmpty ? null : images.first,
                            width: double.infinity,
                            height: 190,
                            fallbackIconSize: 40),
                        Positioned(
                            left: 14,
                            top: 14,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                  color: AppColors.cardSurface,
                                  borderRadius: BorderRadius.circular(8)),
                              child: Text(
                                  '${property['category'] ?? 'Property'}'
                                      .replaceAll('_', ' '),
                                  style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600)),
                            )),
                      ]),
                      Padding(
                          padding: const EdgeInsets.all(18), child: details),
                    ])),
    );
  }
}

class PartnerNavigation extends StatelessWidget {
  const PartnerNavigation(
      {super.key, required this.index, required this.onChanged});
  final int index;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) => NavigationBar(
        selectedIndex: index,
        onDestinationSelected: onChanged,
        destinations: const [
          NavigationDestination(
              icon: Icon(Icons.grid_view_outlined),
              selectedIcon: Icon(Icons.grid_view_rounded),
              label: 'Home'),
          NavigationDestination(
              icon: Icon(Icons.domain_outlined),
              selectedIcon: Icon(Icons.domain_rounded),
              label: 'Listings'),
          NavigationDestination(
              icon: Icon(Icons.account_balance_wallet_outlined),
              selectedIcon: Icon(Icons.account_balance_wallet_rounded),
              label: 'Earnings'),
          NavigationDestination(
              icon: Icon(Icons.headset_mic_outlined),
              selectedIcon: Icon(Icons.headset_mic_rounded),
              label: 'Support'),
          NavigationDestination(
              icon: Icon(Icons.person_outline_rounded),
              selectedIcon: Icon(Icons.person_rounded),
              label: 'Profile'),
        ],
      );
}

class PartnerOnboardingProgress extends StatelessWidget {
  const PartnerOnboardingProgress({super.key, required this.step});
  final int step;

  @override
  Widget build(BuildContext context) => Semantics(
        label: 'Account setup, step $step of 3',
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          PartnerEyebrow('Your partner journey · 0$step / 03'),
          const SizedBox(height: 16),
          Row(
              children: List.generate(
                  3,
                  (index) => Expanded(
                          child: Padding(
                        padding: EdgeInsets.only(right: index == 2 ? 0 : 8),
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                  height: 4,
                                  decoration: BoxDecoration(
                                      color: index < step
                                          ? AppColors.mutedSage
                                          : AppColors.subtleBorder,
                                      borderRadius: BorderRadius.circular(2))),
                              const SizedBox(height: 8),
                              Text(['Profile', 'Identity', 'Payouts'][index],
                                  style: TextStyle(
                                      fontSize: 11,
                                      color: index < step
                                          ? AppColors.primaryDark
                                          : AppColors.secondaryText,
                                      fontWeight: index + 1 == step
                                          ? FontWeight.w700
                                          : FontWeight.w400)),
                            ]),
                      )))),
        ]),
      );
}
