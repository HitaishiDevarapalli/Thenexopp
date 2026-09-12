import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:pin_code_fields/pin_code_fields.dart';
import 'package:sms_autofill/sms_autofill.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/animated_spring_button.dart';
import '../../shared/providers/auth_provider.dart';

class OtpVerificationScreen extends ConsumerStatefulWidget {
  const OtpVerificationScreen({super.key});

  @override
  ConsumerState<OtpVerificationScreen> createState() => _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends ConsumerState<OtpVerificationScreen> with CodeAutoFill {
  final _otpController = TextEditingController();
  bool _isLoading = false;
  int _cooldownSeconds = 60;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
    _listenForOtpSms();
  }

  void _listenForOtpSms() async {
    try {
      await SmsAutoFill().listenForCode();
    } catch (_) {}
  }

  @override
  void codeUpdated() {
    if (code != null && code!.length == 6) {
      setState(() {
        _otpController.text = code!;
      });
      _handleVerify();
    }
  }

  void _startTimer() {
    _cooldownSeconds = 60;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_cooldownSeconds == 0) {
        timer.cancel();
      } else {
        setState(() => _cooldownSeconds--);
      }
    });
  }

  @override
  void dispose() {
    cancel();
    SmsAutoFill().unregisterListener();
    _timer?.cancel();
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _handleVerify() async {
    if (_isLoading) return;
    if (_otpController.text.trim().length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter 6-digit OTP'), backgroundColor: AppColors.statusError),
      );
      return;
    }

    setState(() => _isLoading = true);
    final mobileNumber = ref.read(authProvider).mobileNumber ?? '';
    final success = await ref.read(authProvider.notifier).verifyOtp(mobileNumber, _otpController.text.trim());
    
    if (mounted) {
      setState(() => _isLoading = false);
    }

    if (!success && mounted) {
      final error = ref.read(authProvider).errorMessage ?? 'Verification failed';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error), backgroundColor: AppColors.statusError),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final mobileNumber = ref.watch(authProvider).mobileNumber ?? '';

    return Scaffold(
      backgroundColor: AppColors.primaryBg,
      body: Stack(
        children: [
          // Background subtle warm tint
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    AppColors.warmBeige,
                    AppColors.primaryBg,
                  ],
                  stops: [0.0, 0.4],
                ),
              ),
            ),
          ),

          // Main Content
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Top Bar: Back Button & Centered Logo
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        Align(
                          alignment: Alignment.centerLeft,
                          child: Container(
                            decoration: BoxDecoration(
                              color: AppColors.cardSurface,
                              shape: BoxShape.circle,
                              border: Border.all(color: AppColors.subtleBorder),
                              boxShadow: [
                                BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10),
                              ],
                            ),
                            child: IconButton(
                              icon: const Icon(Icons.arrow_back_rounded, color: AppColors.charcoal, size: 20),
                              onPressed: () => Navigator.pop(context),
                            ),
                          ),
                        ),
                        Image.asset(
                          'assets/images/app_logo.png',
                          height: 52,
                          fit: BoxFit.contain,
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),

                    // Headline: Verification Code (Clean Editorial Typography)
                    Text(
                      'Verification Code',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 26,
                        fontWeight: FontWeight.w700,
                        color: AppColors.charcoal,
                        letterSpacing: -0.5,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 10),

                    // Subtitle with Mobile Number
                    RichText(
                      textAlign: TextAlign.center,
                      text: TextSpan(
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 14,
                          color: AppColors.secondaryText,
                          height: 1.5,
                        ),
                        children: [
                          const TextSpan(text: 'Enter the 6-digit code sent to\n'),
                          TextSpan(
                            text: '+91 $mobileNumber',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: AppColors.charcoal,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Card Container
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 28),
                      decoration: BoxDecoration(
                        color: AppColors.cardSurface,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: AppColors.subtleBorder),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.04),
                            blurRadius: 20,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          PinCodeTextField(
                            appContext: context,
                            length: 6,
                            controller: _otpController,
                            keyboardType: TextInputType.number,
                            animationType: AnimationType.fade,
                            enablePinAutofill: true,
                            autoFocus: true,
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            textStyle: GoogleFonts.plusJakartaSans(
                              fontSize: 20,
                              fontWeight: FontWeight.w700,
                              color: AppColors.charcoal,
                            ),
                            pinTheme: PinTheme(
                              shape: PinCodeFieldShape.box,
                              borderRadius: BorderRadius.circular(12),
                              fieldHeight: 50,
                              fieldWidth: 42,
                              activeColor: AppColors.charcoal,
                              selectedColor: AppColors.sageGreen,
                              inactiveColor: AppColors.subtleBorder,
                              activeFillColor: AppColors.secondaryBg,
                              selectedFillColor: Colors.white,
                              inactiveFillColor: AppColors.secondaryBg,
                              borderWidth: 1.5,
                            ),
                            enableActiveFill: true,
                            onChanged: (val) {},
                            onCompleted: (val) {
                              _handleVerify();
                            },
                          ),
                          const SizedBox(height: 26),

                          // Dark Charcoal Pill Button
                          AnimatedSpringButton(
                            text: 'Verify & Continue',
                            onPressed: _isLoading ? null : _handleVerify,
                            isLoading: _isLoading,
                            height: 52,
                            borderRadius: 26,
                            backgroundColor: AppColors.charcoal,
                            textColor: Colors.white,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Resend Timer Row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          _cooldownSeconds > 0 ? 'Resend code in ${_cooldownSeconds}s' : "Didn't receive the code? ",
                          style: GoogleFonts.plusJakartaSans(
                            color: AppColors.secondaryText,
                            fontSize: 13.5,
                            fontWeight: FontWeight.w400,
                          ),
                        ),
                        if (_cooldownSeconds == 0)
                          TextButton(
                            onPressed: () {
                              ref.read(authProvider.notifier).sendOtp(mobileNumber);
                              _startTimer();
                              _listenForOtpSms();
                            },
                            child: Text(
                              'Resend OTP',
                              style: GoogleFonts.plusJakartaSans(
                                fontWeight: FontWeight.w700,
                                color: AppColors.charcoal,
                                fontSize: 13.5,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
