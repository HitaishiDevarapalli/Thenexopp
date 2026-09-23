import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/api_constants.dart';
import '../../core/widgets/state_widgets.dart';
import '../../core/widgets/app_network_image.dart';
import '../../shared/providers/dio_provider.dart';
import '../../shared/providers/websocket_provider.dart';

class PaymentHistoryScreen extends ConsumerStatefulWidget {
  const PaymentHistoryScreen({super.key});

  @override
  ConsumerState<PaymentHistoryScreen> createState() => _PaymentHistoryScreenState();
}

class _PaymentHistoryScreenState extends ConsumerState<PaymentHistoryScreen> {
  bool _isLoading = true;
  List<dynamic> _payments = [];
  StreamSubscription? _wsSubscription;

  @override
  void initState() {
    super.initState();
    _fetchPayments();

    Future.microtask(() {
      final ws = ref.read(webSocketProvider);
      ws.connect();
      _wsSubscription = ws.events.listen((event) {
        if (event['event'] == 'payment.created' || event['event'] == 'payment.deleted') {
          _fetchPayments();
        }
      });
    });
  }

  @override
  void dispose() {
    _wsSubscription?.cancel();
    super.dispose();
  }

  Future<void> _fetchPayments() async {
    try {
      final dio = ref.read(dioClientProvider).dio;
      final res = await dio.get(ApiConstants.payments);
      if (mounted && res.data['success'] == true) {
        setState(() {
          _payments = res.data['data'];
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _formatDateTime(dynamic dateStr) {
    if (dateStr == null) return 'Recent';
    try {
      final dt = DateTime.parse(dateStr.toString()).toLocal();
      final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      final month = months[dt.month - 1];
      final hour = dt.hour == 0 ? 12 : (dt.hour > 12 ? dt.hour - 12 : dt.hour);
      final period = dt.hour >= 12 ? 'PM' : 'AM';
      final min = dt.minute.toString().padLeft(2, '0');
      return '${dt.day} $month ${dt.year} • ${hour.toString().padLeft(2, '0')}:$min $period';
    } catch (_) {
      return dateStr.toString();
    }
  }

  void _showProofDialog(String url, String txnId) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.cardSurface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          'Payment Proof ($txnId)',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: AppColors.charcoal,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AppNetworkImage(
              imageSource: url,
              bucket: 'payment-proofs',
              height: 250,
              borderRadius: BorderRadius.circular(12),
              fallbackIcon: Icons.receipt_long_rounded,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(
              'Close',
              style: GoogleFonts.plusJakartaSans(
                fontWeight: FontWeight.w700,
                color: AppColors.charcoal,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryBg,
      appBar: AppBar(
        title: Text(
          'Payment Receipts & Proofs',
          style: GoogleFonts.plusJakartaSans(
            fontWeight: FontWeight.w700,
            fontSize: 18,
            color: AppColors.charcoal,
          ),
        ),
        elevation: 0,
      ),
      body: _isLoading
          ? const LoadingSkeletonList()
          : _payments.isEmpty
              ? const EmptyStateWidget(
                  title: 'No Payments Recorded',
                  message: 'Payout receipts and bank transfer proofs with complete timestamps will be listed here once recorded by administration.',
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  physics: const BouncingScrollPhysics(),
                  itemCount: _payments.length,
                  itemBuilder: (context, index) {
                    final p = _payments[index];
                    final isCompleted = p['status'] == 'COMPLETED';

                    return Container(
                      margin: const EdgeInsets.only(bottom: 14),
                      decoration: BoxDecoration(
                        color: AppColors.cardSurface,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.subtleBorder),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.03),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(18),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Header Row: Amount & Status Badge
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  '₹${p['amount']}',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 24,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.charcoal,
                                    letterSpacing: -0.5,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                  decoration: BoxDecoration(
                                    color: isCompleted ? AppColors.lightSage : AppColors.warmBeige,
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    p['status'] ?? 'COMPLETED',
                                    style: GoogleFonts.plusJakartaSans(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w800,
                                      color: isCompleted ? AppColors.sageGreen : const Color(0xFFB45309),
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            const Divider(color: AppColors.subtleBorder, height: 1),
                            const SizedBox(height: 12),

                            // Transaction ID
                            Row(
                              children: [
                                Text(
                                  'Transaction ID: ',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 12.5,
                                    color: AppColors.secondaryText,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                Text(
                                  p['transactionId'] ?? 'N/A',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.charcoal,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),

                            // Payment Method & Live Timestamp with Clock
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: AppColors.secondaryBg,
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: AppColors.subtleBorder),
                                  ),
                                  child: Text(
                                    p['paymentMethod'] ?? 'NEFT',
                                    style: GoogleFonts.plusJakartaSans(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.charcoal,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                const Icon(Icons.schedule_rounded, size: 14, color: AppColors.secondaryText),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    _formatDateTime(p['paidAt']),
                                    style: GoogleFonts.plusJakartaSans(
                                      fontSize: 12,
                                      color: AppColors.secondaryText,
                                      fontWeight: FontWeight.w600,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),

                            // Balance Breakdown if tracked
                            if (p['previousPendingAmount'] != null || p['remainingPendingAmount'] != null) ...[
                              const SizedBox(height: 12),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                decoration: BoxDecoration(
                                  color: AppColors.secondaryBg,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: AppColors.subtleBorder),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Previous Pending',
                                          style: GoogleFonts.plusJakartaSans(
                                            fontSize: 10.5,
                                            color: AppColors.secondaryText,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          '₹${p['previousPendingAmount'] ?? 0}',
                                          style: GoogleFonts.plusJakartaSans(
                                            fontSize: 13,
                                            fontWeight: FontWeight.w700,
                                            color: const Color(0xFFB45309),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const Icon(Icons.arrow_forward_rounded, size: 14, color: AppColors.secondaryText),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.end,
                                      children: [
                                        Text(
                                          'Remaining Pending',
                                          style: GoogleFonts.plusJakartaSans(
                                            fontSize: 10.5,
                                            color: AppColors.secondaryText,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          '₹${p['remainingPendingAmount'] ?? 0}',
                                          style: GoogleFonts.plusJakartaSans(
                                            fontSize: 13,
                                            fontWeight: FontWeight.w700,
                                            color: AppColors.charcoal,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],

                            if (p['notes'] != null && p['notes'].toString().isNotEmpty) ...[
                              const SizedBox(height: 10),
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Icon(Icons.notes_rounded, size: 14, color: AppColors.secondaryText),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      'Note: ${p['notes']}',
                                      style: GoogleFonts.plusJakartaSans(
                                        fontSize: 11.5,
                                        color: AppColors.secondaryText,
                                        fontStyle: FontStyle.italic,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],

                            // Proof Button if Available
                            if (p['paymentProofUrl'] != null) ...[
                              const SizedBox(height: 14),
                              OutlinedButton.icon(
                                onPressed: () => _showProofDialog(p['paymentProofUrl'], p['transactionId']),
                                icon: const Icon(Icons.receipt_long_rounded, size: 16, color: AppColors.charcoal),
                                label: Text(
                                  'View Official Payment Proof Receipt',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 12,
                                    color: AppColors.charcoal,
                                  ),
                                ),
                                style: OutlinedButton.styleFrom(
                                  minimumSize: const Size(double.infinity, 44),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  side: const BorderSide(color: AppColors.subtleBorder),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
