import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/api_constants.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/partner_ui.dart';
import '../../core/widgets/state_widgets.dart';
import '../../shared/providers/dio_provider.dart';
import '../support/support_screen.dart';

enum VerificationDetailsKind { kyc, bank }

class VerificationDetailsScreen extends ConsumerStatefulWidget {
  const VerificationDetailsScreen({super.key, required this.kind});
  final VerificationDetailsKind kind;

  @override
  ConsumerState<VerificationDetailsScreen> createState() =>
      _VerificationDetailsScreenState();
}

class _VerificationDetailsScreenState
    extends ConsumerState<VerificationDetailsScreen> {
  bool _loading = true;
  String? _error;
  Map<String, dynamic>? _details;
  bool get _isKyc => widget.kind == VerificationDetailsKind.kyc;

  @override
  void initState() {
    super.initState();
    _loadDetails();
  }

  Future<void> _loadDetails() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final response = await ref
          .read(dioClientProvider)
          .dio
          .get(_isKyc ? ApiConstants.kycDetails : ApiConstants.bankDetails);
      if (response.data is! Map || response.data['success'] != true) {
        throw StateError('Verification details unavailable');
      }
      final data = response.data['data'];
      if (data != null && data is! Map) {
        throw StateError('Invalid verification response');
      }
      if (!mounted) return;
      setState(() {
        _details = data == null ? null : Map<String, dynamic>.from(data);
        _loading = false;
      });
    } catch (_) {
      if (mounted) {
        setState(() {
          _loading = false;
          _error =
              'Couldn’t load your ${_isKyc ? 'KYC' : 'bank'} details. Please try again.';
        });
      }
    }
  }

  String _value(String key) {
    final value = _details?[key]?.toString().trim();
    return value == null || value.isEmpty ? 'Not provided' : value;
  }

  String _maskedLastFour(String key) {
    final digits =
        (_details?[key]?.toString() ?? '').replaceAll(RegExp(r'\D'), '');
    return digits.length < 4
        ? 'Not provided'
        : 'XXXX XXXX ${digits.substring(digits.length - 4)}';
  }

  String get _maskedPan {
    final value = _details?['panMasked']?.toString().trim() ?? '';
    return value.length == 10 ? 'XXXXX${value.substring(5)}' : 'Not provided';
  }

  @override
  Widget build(BuildContext context) {
    final status = _isKyc
        ? '${_details?['status'] ?? 'NOT_SUBMITTED'}'
        : _details == null
            ? 'NOT_SUBMITTED'
            : _details?['isVerified'] == true
                ? 'VERIFIED'
                : 'SUBMITTED';
    final isEmpty = _details == null || (_isKyc && status == 'NOT_SUBMITTED');
    return Scaffold(
      appBar: AppBar(
          title: Text(_isKyc ? 'Identity & KYC' : 'Bank & payout details')),
      body: RefreshIndicator(
        onRefresh: _loadDetails,
        child: _loading
            ? const LoadingSkeletonList(itemCount: 3)
            : ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(24),
                children: [
                    if (_error != null)
                      ErrorStateWidget(message: _error!, onRetry: _loadDetails)
                    else if (isEmpty)
                      EmptyStateWidget(
                          title: _isKyc
                              ? 'No KYC details submitted'
                              : 'No bank details submitted',
                          message:
                              'Contact the partner desk for help completing your account verification.',
                          icon: _isKyc
                              ? Icons.verified_user_outlined
                              : Icons.account_balance_outlined,
                          buttonText: 'Contact partner support',
                          onAction: _openSupport)
                    else ...[
                      PartnerEyebrow(_isKyc
                          ? 'Your identity verification'
                          : 'Your payout account'),
                      const SizedBox(height: 16),
                      PartnerStatus(status),
                      const SizedBox(height: 24),
                      PartnerSurface(
                          child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                            if (_isKyc) ...[
                              _detail('Aadhaar number',
                                  _maskedLastFour('aadhaarMasked')),
                              const Divider(height: 32),
                              _detail('PAN number', _maskedPan),
                              if (_details?['rejectionReason'] != null &&
                                  _value('rejectionReason') !=
                                      'Not provided') ...[
                                const Divider(height: 32),
                                _detail('Review feedback',
                                    _value('rejectionReason')),
                              ],
                            ] else ...[
                              _detail('Bank account number',
                                  _maskedLastFour('accountLast4')),
                              const Divider(height: 32),
                              _detail('IFSC code', _value('ifscCode')),
                              const Divider(height: 32),
                              _detail('UPI ID', _value('upiId')),
                              if (_details?['phonepeNumber'] != null &&
                                  _value('phonepeNumber') !=
                                      'Not provided') ...[
                                const Divider(height: 32),
                                _detail(
                                    'PhonePe number', _value('phonepeNumber')),
                              ],
                            ],
                          ])),
                      const SizedBox(height: 20),
                      Text(
                          'These are the details currently saved on your account. For corrections, contact the partner desk.',
                          style: Theme.of(context).textTheme.bodyMedium),
                      const SizedBox(height: 24),
                      OutlinedButton.icon(
                          onPressed: _openSupport,
                          icon:
                              const Icon(Icons.support_agent_rounded, size: 20),
                          label: const Text('Contact partner support')),
                    ],
                  ]),
      ),
    );
  }

  Widget _detail(String label, String value) =>
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: Theme.of(context).textTheme.bodySmall),
        const SizedBox(height: 8),
        SelectableText(value,
            style: Theme.of(context)
                .textTheme
                .titleMedium
                ?.copyWith(color: AppColors.primaryDark)),
      ]);

  void _openSupport() => Navigator.push(
      context, MaterialPageRoute(builder: (_) => const SupportScreen()));
}
