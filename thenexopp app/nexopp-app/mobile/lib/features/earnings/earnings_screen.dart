import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/widgets/partner_ui.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/api_constants.dart';
import '../../core/widgets/state_widgets.dart';
import '../../shared/providers/dio_provider.dart';
import '../../shared/providers/websocket_provider.dart';
import '../payments/payment_history_screen.dart';

class EarningsScreen extends ConsumerStatefulWidget {
  const EarningsScreen({super.key});

  @override
  ConsumerState<EarningsScreen> createState() => _EarningsScreenState();
}

class _EarningsScreenState extends ConsumerState<EarningsScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  Map<String, dynamic> _summary = {};
  List<dynamic> _earnings = [];
  StreamSubscription? _wsSubscription;

  @override
  void initState() {
    super.initState();
    _fetchEarnings();

    Future.microtask(() {
      final ws = ref.read(webSocketProvider);
      ws.connect();
      _wsSubscription = ws.events.listen((event) {
        final ev = event['event'];
        if (ev == 'earnings.updated' ||
            ev == 'payment.created' ||
            ev == 'pending_payments.updated' ||
            ev == 'property.approved') {
          _fetchEarnings();
        }
      });
    });
  }

  @override
  void dispose() {
    _wsSubscription?.cancel();
    super.dispose();
  }

  Future<void> _fetchEarnings() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final dio = ref.read(dioClientProvider).dio;
      final res = await dio.get(ApiConstants.earnings);
      if (res.data['success'] != true) throw StateError('Earnings unavailable');
      if (mounted && res.data['success'] == true) {
        setState(() {
          _summary = res.data['data']['summary'];
          _earnings = res.data['data']['earnings'];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Unable to load earnings data';
          _isLoading = false;
        });
      }
    }
  }

  void _openReceipts() => Navigator.push(
      context, MaterialPageRoute(builder: (_) => const PaymentHistoryScreen()));

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Earnings'), actions: [
          IconButton(
              tooltip: 'Payment receipts',
              onPressed: _openReceipts,
              icon: const Icon(Icons.receipt_long_outlined)),
          const SizedBox(width: 12),
        ]),
        body: RefreshIndicator(
          onRefresh: _fetchEarnings,
          child: _isLoading
              ? const LoadingSkeletonList()
              : _errorMessage != null
                  ? ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: [
                          ErrorStateWidget(
                              message: _errorMessage!, onRetry: _fetchEarnings)
                        ])
                  : ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
                      children: [
                          const PartnerEyebrow('The rewards of your work'),
                          const SizedBox(height: 16),
                          PartnerBalanceCard(
                              label: 'Pending payout',
                              amount:
                                  partnerCurrency(_summary['pendingEarnings']),
                              metrics: [
                                (
                                  label: 'Total earned',
                                  value:
                                      partnerCurrency(_summary['totalEarnings'])
                                ),
                                (
                                  label: 'Paid to you',
                                  value: partnerCurrency(_summary['paidAmount'])
                                ),
                                (
                                  label: 'This month',
                                  value: partnerCurrency(
                                      _summary['thisMonthEarnings'])
                                ),
                              ]),
                          const SizedBox(height: 20),
                          const PartnerSurface(
                              child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                Icon(Icons.account_balance_outlined,
                                    size: 20, color: AppColors.mutedSage),
                                SizedBox(width: 12),
                                Expanded(
                                    child: Text(
                                        'Track approved commissions and your completed payouts here.',
                                        style: TextStyle(
                                            fontSize: 12,
                                            height: 1.6,
                                            color: AppColors.secondaryText))),
                              ])),
                          PartnerSection('Earning activity',
                              action: 'Receipts', onAction: _openReceipts),
                          if (_earnings.isEmpty)
                            const PartnerSurface(
                                child: EmptyStateWidget(
                                    title: 'Your hard work will show here',
                                    icon: Icons.account_balance_wallet_outlined,
                                    message:
                                        'Your commissions appear here once they have been recorded.'))
                          else
                            ..._earnings.map((earning) {
                              final isPaid = earning['status'] == 'PAID';
                              final date =
                                  DateTime.tryParse('${earning['earnedDate']}');
                              final subtitle = date == null
                                  ? 'Commission'
                                  : '${date.day}/${date.month}/${date.year}';
                              return Padding(
                                  padding: const EdgeInsets.only(bottom: 12),
                                  child: PartnerSurface(
                                    padding: const EdgeInsets.all(18),
                                    child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Container(
                                                    padding:
                                                        const EdgeInsets.all(
                                                            10),
                                                    decoration: BoxDecoration(
                                                        color: AppColors
                                                            .secondaryBg,
                                                        borderRadius:
                                                            BorderRadius
                                                                .circular(14)),
                                                    child: Icon(
                                                        isPaid
                                                            ? Icons
                                                                .south_west_rounded
                                                            : Icons
                                                                .schedule_rounded,
                                                        size: 20,
                                                        color: AppColors
                                                            .mutedSage)),
                                                const SizedBox(width: 12),
                                                Expanded(
                                                    child: Column(
                                                        crossAxisAlignment:
                                                            CrossAxisAlignment
                                                                .start,
                                                        children: [
                                                      Text(
                                                          '${earning['title'] ?? 'Commission'}',
                                                          style:
                                                              Theme.of(context)
                                                                  .textTheme
                                                                  .titleSmall),
                                                      const SizedBox(height: 6),
                                                      Text(subtitle,
                                                          style:
                                                              Theme.of(context)
                                                                  .textTheme
                                                                  .bodySmall),
                                                    ])),
                                              ]),
                                          const SizedBox(height: 14),
                                          Wrap(
                                              spacing: 16,
                                              runSpacing: 10,
                                              crossAxisAlignment:
                                                  WrapCrossAlignment.center,
                                              children: [
                                                Text(
                                                    '+${partnerCurrency(earning['amount'])}',
                                                    style: Theme.of(context)
                                                        .textTheme
                                                        .titleLarge),
                                                PartnerStatus(isPaid
                                                    ? 'PAID'
                                                    : '${earning['status'] ?? 'PENDING'}'),
                                              ]),
                                        ]),
                                  ));
                            }),
                        ]),
        ),
      );
}
