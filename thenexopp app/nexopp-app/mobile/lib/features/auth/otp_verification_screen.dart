import 'dart:async';
import '../../core/widgets/partner_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/services.dart';
import 'package:pin_code_fields/pin_code_fields.dart';
import 'package:sms_autofill/sms_autofill.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/animated_spring_button.dart';
import '../../shared/providers/auth_provider.dart';

class OtpVerificationScreen extends ConsumerStatefulWidget {
  const OtpVerificationScreen({super.key});

  @override
  ConsumerState<OtpVerificationScreen> createState() =>
      _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends ConsumerState<OtpVerificationScreen>
    with CodeAutoFill {
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
        const SnackBar(
            content: Text('Please enter 6-digit OTP'),
            backgroundColor: AppColors.statusError),
      );
      return;
    }

    setState(() => _isLoading = true);
    final mobileNumber = ref.read(authProvider).mobileNumber ?? '';
    final success = await ref
        .read(authProvider.notifier)
        .verifyOtp(mobileNumber, _otpController.text.trim());

    if (mounted) {
      setState(() => _isLoading = false);
    }

    if (!success && mounted) {
      final error =
          ref.read(authProvider).errorMessage ?? 'Verification failed';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error), backgroundColor: AppColors.statusError),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final mobileNumber = ref.watch(authProvider).mobileNumber ?? '';
    return Scaffold(
      appBar:
          AppBar(leading: BackButton(onPressed: () => Navigator.pop(context))),
      body: SafeArea(
          child: Center(
              child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 520),
        child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Align(
                    alignment: Alignment.centerLeft,
                    child: Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                            color: AppColors.lightSage,
                            borderRadius: BorderRadius.circular(24)),
                        child: const Icon(Icons.mark_chat_read_outlined,
                            size: 32, color: AppColors.primaryDark))),
                const SizedBox(height: 32),
                const PartnerEyebrow('One small step'),
                const SizedBox(height: 12),
                Text('Let’s make it you.',
                    style: Theme.of(context).textTheme.displayMedium),
                const SizedBox(height: 12),
                Text('Enter the 6-digit verification code sent to',
                    style: Theme.of(context).textTheme.bodyMedium),
                const SizedBox(height: 4),
                Text('+91 $mobileNumber',
                    style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 32),
                LayoutBuilder(
                    builder: (context, constraints) => PinCodeTextField(
                          appContext: context,
                          length: 6,
                          controller: _otpController,
                          autoDisposeControllers: false,
                          keyboardType: TextInputType.number,
                          inputFormatters: [
                            FilteringTextInputFormatter.digitsOnly
                          ],
                          animationType: AnimationType.fade,
                          enablePinAutofill: true,
                          autoFocus: true,
                          textStyle: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w600,
                              color: AppColors.primaryDark),
                          pinTheme: PinTheme(
                              shape: PinCodeFieldShape.box,
                              borderRadius: BorderRadius.circular(12),
                              fieldHeight: 58,
                              fieldWidth: ((constraints.maxWidth - 40) / 6)
                                  .clamp(28.0, 56.0),
                              activeColor: AppColors.mutedSage,
                              selectedColor: AppColors.primaryDark,
                              inactiveColor: AppColors.subtleBorder,
                              activeFillColor: AppColors.lightSage,
                              selectedFillColor: Colors.white,
                              inactiveFillColor: Colors.white,
                              borderWidth: 1),
                          enableActiveFill: true,
                          onChanged: (_) {},
                          onCompleted: (_) => _handleVerify(),
                        )),
                const SizedBox(height: 24),
                AnimatedSpringButton(
                    text: 'Verify & continue',
                    onPressed: _isLoading ? null : _handleVerify,
                    isLoading: _isLoading,
                    borderRadius: 16),
                const SizedBox(height: 20),
                if (_cooldownSeconds > 0)
                  Text('You can request a new code in ${_cooldownSeconds}s',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodySmall)
                else
                  TextButton(
                      onPressed: _resendCode,
                      child: const Text('Send a new code')),
                const SizedBox(height: 24),
                const Center(
                    child: PartnerEyebrow('Secure access. Simple beginnings.')),
              ],
            )),
      ))),
    );
  }

  Future<void> _resendCode() async {
    if (_isLoading) return;
    setState(() => _isLoading = true);
    final success = await ref
        .read(authProvider.notifier)
        .sendOtp(ref.read(authProvider).mobileNumber ?? '');
    if (!mounted) return;
    setState(() => _isLoading = false);
    if (success) {
      _startTimer();
      _listenForOtpSms();
    } else
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(ref.read(authProvider).errorMessage ??
              'Couldn’t resend your code. Please try again.')));
  }
}
