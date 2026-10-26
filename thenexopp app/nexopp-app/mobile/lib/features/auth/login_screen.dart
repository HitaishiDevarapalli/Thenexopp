import '../../core/widgets/partner_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/animated_spring_button.dart';
import '../../shared/providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _mobileController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  @override
  void dispose() {
    _mobileController.dispose();
    super.dispose();
  }

  Future<void> _handleSendOtp() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    final success = await ref
        .read(authProvider.notifier)
        .sendOtp(_mobileController.text.trim());

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (mounted) {
      if (success) {
        context.push('/otp');
      } else {
        final error =
            ref.read(authProvider).errorMessage ?? 'Failed to send OTP';
        if (error.toLowerCase().contains('wait') ||
            error.toLowerCase().contains('cooldown') ||
            error.toLowerCase().contains('already')) {
          context.push('/otp');
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
                content: Text(error), backgroundColor: AppColors.statusError),
          );
        }
      }
    }
  }

  void _showTroubleSigningInDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(Icons.headset_mic_rounded,
                color: Color(0xFF047857), size: 22),
            const SizedBox(width: 8),
            Text(
              'Partner Support',
              style: GoogleFonts.plusJakartaSans(
                  fontWeight: FontWeight.w700,
                  fontSize: 17,
                  color: const Color(0xFF111827)),
            ),
          ],
        ),
        content: Text(
          'For assistance with logging in or OTP verification, please connect with our partner desk:\n\n📞 Helpline: +91 89775 05204\n💬 WhatsApp: Available 24/7',
          style: GoogleFonts.plusJakartaSans(
              fontSize: 14, color: const Color(0xFF4B5563), height: 1.45),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel',
                style: GoogleFonts.plusJakartaSans(
                    color: const Color(0xFF6B7280))),
          ),
          ElevatedButton.icon(
            onPressed: () async {
              Navigator.pop(ctx);
              final uri = Uri.parse('tel:+918977505204');
              try {
                await launchUrl(uri, mode: LaunchMode.externalApplication);
              } catch (_) {}
            },
            icon: const Icon(Icons.call_rounded, size: 16),
            label: Text('Call Support',
                style:
                    GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w600)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF047857),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8)),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
          child: Center(
              child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 520),
        child: SingleChildScrollView(
          keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
          padding: const EdgeInsets.all(24),
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Row(children: [
              IconButton.outlined(
                  tooltip: 'Back to welcome',
                  onPressed: () => context.go('/'),
                  icon: const Icon(Icons.arrow_back_rounded, size: 20)),
              const Spacer(),
              const PartnerEyebrow('TheNexopp / Agent'),
            ]),
            const SizedBox(height: 24),
            ClipRRect(
                borderRadius: BorderRadius.circular(28),
                child: SizedBox(
                  height: 210,
                  child: Stack(fit: StackFit.expand, children: [
                    Image.asset('assets/images/login_bg.png',
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) =>
                            const ColoredBox(color: AppColors.primaryDark)),
                    const DecoratedBox(
                        decoration: BoxDecoration(
                            gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                          Color(0x00102C26),
                          Color(0xDD102C26)
                        ]))),
                    const Positioned(
                        left: 22,
                        right: 22,
                        bottom: 22,
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              PartnerEyebrow('Built for your ambition',
                                  color: Color(0xFFE3D3AC)),
                              SizedBox(height: 8),
                              Text('Your next chapter\nstarts here.',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 28,
                                      fontWeight: FontWeight.w600,
                                      height: 1.2,
                                      letterSpacing: -.8)),
                            ])),
                  ]),
                )),
            const SizedBox(height: 28),
            Text('Welcome, partner.',
                style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 8),
            Text(
                'Sign in to manage your listings and keep your earnings in view.',
                style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 24),
            Form(
                key: _formKey,
                child: AutofillGroup(
                    child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text('Mobile number',
                        style: Theme.of(context).textTheme.titleSmall),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: _mobileController,
                      keyboardType: TextInputType.phone,
                      autofillHints: const [
                        AutofillHints.telephoneNumberNational
                      ],
                      textInputAction: TextInputAction.done,
                      onFieldSubmitted: (_) {
                        if (!_isLoading) _handleSendOtp();
                      },
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                        LengthLimitingTextInputFormatter(10)
                      ],
                      decoration: const InputDecoration(
                        hintText: '10-digit mobile number',
                        prefixIcon: Padding(
                            padding: EdgeInsets.fromLTRB(18, 16, 14, 16),
                            child: Text('+91',
                                style: TextStyle(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 15))),
                      ),
                      validator: (value) =>
                          value == null || value.trim().length != 10
                              ? 'Enter a valid 10-digit mobile number'
                              : null,
                    ),
                    const SizedBox(height: 12),
                    const Row(children: [
                      Icon(Icons.lock_outline_rounded,
                          size: 14, color: AppColors.mutedSage),
                      SizedBox(width: 6),
                      Expanded(
                          child: Text(
                              'We’ll send a one-time code to verify it.',
                              style: TextStyle(
                                  fontSize: 11,
                                  color: AppColors.secondaryText))),
                    ]),
                    const SizedBox(height: 24),
                    AnimatedSpringButton(
                        text: 'Continue securely',
                        icon: Icons.arrow_forward_rounded,
                        onPressed: _isLoading ? null : _handleSendOtp,
                        isLoading: _isLoading,
                        borderRadius: 16),
                  ],
                ))),
            const SizedBox(height: 14),
            TextButton.icon(
                onPressed: _showTroubleSigningInDialog,
                icon: const Icon(Icons.support_agent_rounded, size: 18),
                label: const Text('Need help signing in?')),
            const SizedBox(height: 18),
            const Center(child: PartnerEyebrow('Where next happens')),
            const SizedBox(height: 12),
          ]),
        ),
      ))),
    );
  }
}
