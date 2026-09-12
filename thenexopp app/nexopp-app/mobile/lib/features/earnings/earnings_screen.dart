import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
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
        if (ev == 'earnings.updated' || ev == 'payment.created' || ev == 'pending_payments.updated' || ev == 'property.approved') {
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryBg,
      appBar: AppBar(
        title: Text(
          'Earnings & Payouts',
          style: GoogleFonts.plusJakartaSans(
            fontWeight: FontWeight.w700,
            fontSize: 18,
            color: AppColors.charcoal,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.receipt_long_rounded, color: AppColors.charcoal, size: 22),
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const PaymentHistoryScreen()));
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: _isLoading
          ? const LoadingSkeletonList()
          : _errorMessage != null
              ? ErrorStateWidget(message: _errorMessage!, onRetry: _fetchEarnings)
              : RefreshIndicator(
                  color: AppColors.charcoal,
                  onRefresh: _fetchEarnings,
                  child: ListView(
                    physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
                    children: [
                      // Executive Summary Card (Dark Charcoal Luxury Hero Card)
                      Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: AppColors.charcoal,
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withOpacity(0.12), blurRadius: 20, offset: const Offset(0, 8)),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'PENDING BALANCE',
                                  style: GoogleFonts.plusJakartaSans(
                                    color: Colors.white.withOpacity(0.65),
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 1.0,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppColors.sageGreen.withOpacity(0.3),
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(color: AppColors.sageGreen.withOpacity(0.5)),
                                  ),
                                  child: Text(
                                    'To Be Paid',
                                    style: GoogleFonts.plusJakartaSans(
                                      color: Colors.white,
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Text(
                              '₹${((_summary['pendingEarnings'] ?? 0) as num).toStringAsFixed(2)}',
                              style: GoogleFonts.plusJakartaSans(
                                color: Colors.white,
                                fontSize: 34,
                                fontWeight: FontWeight.w800,
                                letterSpacing: -0.6,
                              ),
                            ),
                            const SizedBox(height: 20),
                            Divider(color: Colors.white.withOpacity(0.15), height: 1),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                _buildSummaryItemDark('Total Commission', '₹${((_summary['totalEarnings'] ?? 0) as num).toStringAsFixed(2)}'),
                                _buildSummaryItemDark('Total Paid', '₹${((_summary['paidAmount'] ?? 0) as num).toStringAsFixed(2)}'),
                                _buildSummaryItemDark('This Month', '₹${((_summary['thisMonthEarnings'] ?? 0) as num).toStringAsFixed(2)}'),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 28),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Earning Records',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: AppColors.charcoal,
                              letterSpacing: -0.3,
                            ),
                          ),
                          TextButton.icon(
                            onPressed: () {
                              Navigator.push(context, MaterialPageRoute(builder: (_) => const PaymentHistoryScreen()));
                            },
                            icon: const Icon(Icons.receipt_rounded, size: 16, color: AppColors.sageGreen),
                            label: Text(
                              'View Receipts',
                              style: GoogleFonts.plusJakartaSans(
                                color: AppColors.sageGreen,
                                fontWeight: FontWeight.w700,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      if (_earnings.isEmpty)
                        const EmptyStateWidget(
                          title: 'No Earnings Recorded',
                          message: 'Earnings will appear here when properties are verified or work payouts are generated by administration.',
                        )
                      else
                        ..._earnings.map((e) {
                          final isPaid = e['status'] == 'PAID';
                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            decoration: BoxDecoration(
                              color: AppColors.cardSurface,
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: AppColors.subtleBorder),
                              boxShadow: [
                                BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 2)),
                              ],
                            ),
                            child: ListTile(
                              contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                              leading: Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: isPaid ? AppColors.lightSage : AppColors.warmBeige,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Icon(
                                  isPaid ? Icons.check_circle_rounded : Icons.pending_actions_rounded,
                                  color: isPaid ? AppColors.sageGreen : const Color(0xFFB45309),
                                  size: 22,
                                ),
                              ),
                              title: Text(
                                e['title'] ?? 'Commission',
                                style: GoogleFonts.plusJakartaSans(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 15,
                                  color: AppColors.charcoal,
                                ),
                              ),
                              subtitle: Text(
                                e['earnedDate'] != null ? e['earnedDate'].toString().substring(0, 10) : 'Recent',
                                style: GoogleFonts.plusJakartaSans(color: AppColors.secondaryText, fontSize: 12),
                              ),
                              trailing: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    '+₹${e['amount']}',
                                    style: GoogleFonts.plusJakartaSans(
                                      fontWeight: FontWeight.w800,
                                      fontSize: 16,
                                      color: AppColors.charcoal,
                                      letterSpacing: -0.2,
                                    ),
                                  ),
                                  const SizedBox(height: 3),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: isPaid ? AppColors.lightSage : AppColors.warmBeige,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      isPaid ? 'PAID OUT' : 'PENDING',
                                      style: GoogleFonts.plusJakartaSans(
                                        fontSize: 9.5,
                                        fontWeight: FontWeight.w800,
                                        color: isPaid ? AppColors.sageGreen : const Color(0xFFB45309),
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }),
                    ],
                  ),
                ),
    );
  }

  Widget _buildSummaryItemDark(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.plusJakartaSans(
            color: Colors.white.withOpacity(0.6),
            fontSize: 11,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: GoogleFonts.plusJakartaSans(
            color: Colors.white,
            fontWeight: FontWeight.w700,
            fontSize: 14.5,
            letterSpacing: -0.2,
          ),
        ),
      ],
    );
  }
}
