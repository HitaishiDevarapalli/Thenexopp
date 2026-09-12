import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:dio/dio.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/api_constants.dart';
import '../../core/widgets/animated_spring_button.dart';
import '../../shared/providers/dio_provider.dart';
import '../../shared/providers/auth_provider.dart';

class BankOnboardingScreen extends ConsumerStatefulWidget {
  const BankOnboardingScreen({super.key});

  @override
  ConsumerState<BankOnboardingScreen> createState() => _BankOnboardingScreenState();
}

class _BankOnboardingScreenState extends ConsumerState<BankOnboardingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _accountController = TextEditingController();
  final _confirmAccountController = TextEditingController();
  final _ifscController = TextEditingController();
  final _upiController = TextEditingController();
  final _phonepeController = TextEditingController();

  bool _isLoading = false;
  bool _obscureAccount = true;

  @override
  void dispose() {
    _accountController.dispose();
    _confirmAccountController.dispose();
    _ifscController.dispose();
    _upiController.dispose();
    _phonepeController.dispose();
    super.dispose();
  }

  Future<void> _submitBankDetails() async {
    if (!_formKey.currentState!.validate()) return;
    if (_accountController.text.trim() != _confirmAccountController.text.trim()) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Account numbers do not match', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
          backgroundColor: AppColors.statusError,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final dio = ref.read(dioClientProvider).dio;
      final payload = <String, dynamic>{
        'accountNumber': _accountController.text.trim(),
        'confirmAccountNumber': _confirmAccountController.text.trim(),
        'ifscCode': _ifscController.text.trim().toUpperCase(),
        'upiId': _upiController.text.trim(),
      };
      if (_phonepeController.text.trim().isNotEmpty) {
        payload['phonepeNumber'] = _phonepeController.text.trim();
      }

      final response = await dio.post(ApiConstants.submitBankDetails, data: payload);

      if (response.statusCode == 200 || response.data?['success'] == true) {
        if (mounted) {
          ref.read(authProvider.notifier).updateAgentState('PENDING_APPROVAL');
        }
      } else {
        final msg = response.data?['message']?.toString() ?? 'Failed to submit bank details.';
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(msg), backgroundColor: AppColors.statusError),
          );
        }
      }
    } catch (e) {
      debugPrint('[BankOnboarding] Error: $e');
      String errorMsg = 'Failed to submit bank details. Please verify your Account & IFSC.';
      if (e is DioException && e.response?.data is Map) {
        final backendMsg = e.response?.data['message'];
        if (backendMsg is List) {
          errorMsg = backendMsg.join(', ');
        } else if (backendMsg != null) {
          errorMsg = backendMsg.toString();
        }
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(errorMsg), backgroundColor: AppColors.statusError),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          'Bank & Payout (Step 3 of 3)',
          style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 16),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: const Color(0xFF0F172A),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: const LinearProgressIndicator(
                    value: 1.0,
                    minHeight: 6,
                    backgroundColor: Color(0xFFE2E8F0),
                    color: Color(0xFF047857),
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'Banking & Payout Details',
                  style: GoogleFonts.inter(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF0F172A),
                    letterSpacing: -0.3,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Earnings will be transferred directly to this bank account or UPI ID.',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    color: const Color(0xFF475569),
                    height: 1.45,
                  ),
                ),
                const SizedBox(height: 28),

                // Card Container for Inputs
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.02),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      // Bank Account Number
                      TextFormField(
                        controller: _accountController,
                        keyboardType: TextInputType.number,
                        obscureText: _obscureAccount,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                          LengthLimitingTextInputFormatter(18),
                        ],
                        style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600, color: const Color(0xFF0F172A)),
                        decoration: InputDecoration(
                          labelText: 'Bank Account Number (9 to 18 Digits)',
                          hintText: 'e.g. 918234567890',
                          helperText: 'Enter 9 to 18 digit bank account number',
                          labelStyle: GoogleFonts.inter(color: const Color(0xFF64748B), fontSize: 13.5),
                          prefixIcon: const Icon(Icons.account_balance_rounded, color: Color(0xFF047857)),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscureAccount ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                              color: const Color(0xFF94A3B8),
                              size: 20,
                            ),
                            onPressed: () => setState(() => _obscureAccount = !_obscureAccount),
                          ),
                          filled: true,
                          fillColor: const Color(0xFFF8FAFC),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF047857), width: 1.5)),
                        ),
                        validator: (val) {
                          final clean = val?.trim() ?? '';
                          if (clean.length < 9 || clean.length > 18) {
                            return 'Enter valid account number (9 to 18 digits)';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 18),

                      // Confirm Bank Account Number
                      TextFormField(
                        controller: _confirmAccountController,
                        keyboardType: TextInputType.number,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                          LengthLimitingTextInputFormatter(18),
                        ],
                        style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600, color: const Color(0xFF0F172A)),
                        decoration: InputDecoration(
                          labelText: 'Confirm Bank Account Number',
                          hintText: 'Re-enter bank account number',
                          labelStyle: GoogleFonts.inter(color: const Color(0xFF64748B), fontSize: 13.5),
                          prefixIcon: const Icon(Icons.account_balance_wallet_rounded, color: Color(0xFF047857)),
                          filled: true,
                          fillColor: const Color(0xFFF8FAFC),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF047857), width: 1.5)),
                        ),
                        validator: (val) {
                          final clean = val?.trim() ?? '';
                          if (clean.isEmpty) return 'Please confirm bank account number';
                          if (clean != _accountController.text.trim()) return 'Account numbers do not match';
                          return null;
                        },
                      ),
                      const SizedBox(height: 18),

                      // IFSC Code
                      TextFormField(
                        controller: _ifscController,
                        textCapitalization: TextCapitalization.characters,
                        inputFormatters: [
                          LengthLimitingTextInputFormatter(11),
                          FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z0-9]')),
                        ],
                        style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600, color: const Color(0xFF0F172A), letterSpacing: 1.0),
                        decoration: InputDecoration(
                          labelText: 'IFSC Code (11 Characters)',
                          hintText: 'e.g. SBIN0001234',
                          helperText: '11-character bank branch IFSC code',
                          labelStyle: GoogleFonts.inter(color: const Color(0xFF64748B), fontSize: 13.5),
                          prefixIcon: const Icon(Icons.location_city_rounded, color: Color(0xFF047857)),
                          filled: true,
                          fillColor: const Color(0xFFF8FAFC),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF047857), width: 1.5)),
                        ),
                        validator: (val) {
                          final clean = val?.trim().toUpperCase() ?? '';
                          if (clean.length != 11) return 'IFSC must be exactly 11 characters (e.g. SBIN0001234)';
                          return null;
                        },
                      ),
                      const SizedBox(height: 18),

                      // Primary UPI ID
                      TextFormField(
                        controller: _upiController,
                        style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600, color: const Color(0xFF0F172A)),
                        decoration: InputDecoration(
                          labelText: 'Primary UPI ID (e.g. agent@upi)',
                          hintText: 'e.g. name@okaxis or 9876543210@upi',
                          helperText: 'Must contain @ handle for instant payout',
                          labelStyle: GoogleFonts.inter(color: const Color(0xFF64748B), fontSize: 13.5),
                          prefixIcon: const Icon(Icons.qr_code_rounded, color: Color(0xFF047857)),
                          filled: true,
                          fillColor: const Color(0xFFF8FAFC),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF047857), width: 1.5)),
                        ),
                        validator: (val) {
                          final clean = val?.trim() ?? '';
                          if (!clean.contains('@') || clean.length < 5) {
                            return 'Enter valid UPI ID (e.g. name@okaxis)';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 18),

                      // PhonePe / Paytm Number (Optional)
                      TextFormField(
                        controller: _phonepeController,
                        keyboardType: TextInputType.phone,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                          LengthLimitingTextInputFormatter(10),
                        ],
                        style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600, color: const Color(0xFF0F172A)),
                        decoration: InputDecoration(
                          labelText: 'PhonePe / Paytm Number (10 Digits)',
                          hintText: 'e.g. 9876543210 (Optional)',
                          helperText: 'Must be exactly 10 digits if provided',
                          labelStyle: GoogleFonts.inter(color: const Color(0xFF64748B), fontSize: 13.5),
                          prefixIcon: const Icon(Icons.phone_iphone_rounded, color: Color(0xFF047857)),
                          filled: true,
                          fillColor: const Color(0xFFF8FAFC),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF047857), width: 1.5)),
                        ),
                        validator: (val) {
                          final clean = val?.trim() ?? '';
                          if (clean.isNotEmpty && clean.length != 10) {
                            return 'PhonePe number must be exactly 10 digits';
                          }
                          return null;
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 28),

                // Animated Submit Button
                AnimatedSpringButton(
                  text: 'Complete Registration & Submit for Review',
                  onPressed: _isLoading ? null : _submitBankDetails,
                  isLoading: _isLoading,
                  height: 52,
                  borderRadius: 12,
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
