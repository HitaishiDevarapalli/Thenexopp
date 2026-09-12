import 'dart:ui';
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

    setState(() => _isLoading = false);

    if (mounted) {
      if (success) {
        context.push('/otp');
      } else {
        final error = ref.read(authProvider).errorMessage ?? 'Failed to send OTP';
        if (error.toLowerCase().contains('wait') || error.toLowerCase().contains('cooldown') || error.toLowerCase().contains('already')) {
          context.push('/otp');
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(error), backgroundColor: AppColors.statusError),
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
            const Icon(Icons.headset_mic_rounded, color: Color(0xFF047857), size: 22),
            const SizedBox(width: 8),
            Text(
              'Partner Support',
              style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 17, color: const Color(0xFF111827)),
            ),
          ],
        ),
        content: Text(
          'For assistance with logging in or OTP verification, please connect with our partner desk:\n\n📞 Helpline: +91 89775 05204\n💬 WhatsApp: Available 24/7',
          style: GoogleFonts.inter(fontSize: 14, color: const Color(0xFF4B5563), height: 1.45),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel', style: GoogleFonts.inter(color: const Color(0xFF6B7280))),
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
            label: Text('Call Support', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF047857),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // 1. Pristine Clean Architectural Villa Background
          Positioned.fill(
            child: Image.asset(
              'assets/images/login_bg.png',
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Image.network(
                'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&auto=format&fit=crop&q=85',
                fit: BoxFit.cover,
              ),
            ),
          ),

          // 2. Soft Luminous Daylight Mist Gradient
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.white.withOpacity(0.90),
                    Colors.white.withOpacity(0.52),
                    Colors.white.withOpacity(0.92),
                  ],
                  stops: const [0.0, 0.45, 1.0],
                ),
              ),
            ),
          ),

          // 3. Main Login Content
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Top Bar: Back to Welcome / Splash
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
                          icon: const Icon(Icons.arrow_back_rounded, color: AppColors.primaryDark, size: 20),
                          onPressed: () => context.go('/'),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Official TheNexopp Brand Logo (Directly on canvas, transparent PNG)
                    Center(
                      child: Image.asset(
                        'assets/images/app_logo.png',
                        height: 92,
                        fit: BoxFit.contain,
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Tagline: — Where Next Happens —
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 24,
                          height: 1.5,
                          decoration: BoxDecoration(
                            color: AppColors.mutedSage.withOpacity(0.60),
                            borderRadius: BorderRadius.circular(1),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Where Next Happens',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            fontStyle: FontStyle.italic,
                            color: AppColors.primaryDark,
                            letterSpacing: 0.2,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          width: 24,
                          height: 1.5,
                          decoration: BoxDecoration(
                            color: AppColors.mutedSage.withOpacity(0.60),
                            borderRadius: BorderRadius.circular(1),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 28),

                    // Headline: Partner Sign In
                    Text(
                      'Partner Sign In',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 27,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primaryDark,
                        letterSpacing: -0.5,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),

                    // Subtitle
                    Text(
                      'Sign in for property access, live\ncommission tracking, and\nseamless transactions.',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 14,
                        color: AppColors.secondaryText,
                        fontWeight: FontWeight.w400,
                        height: 1.45,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),

                    // 4. Frosted Card Container
                    ClipRRect(
                      borderRadius: BorderRadius.circular(24),
                      child: BackdropFilter(
                        filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.92),
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(
                              color: AppColors.subtleBorder,
                              width: 1.2,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.06),
                                blurRadius: 24,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: Form(
                            key: _formKey,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                // Input Label
                                Text(
                                  'Mobile Number',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.primaryDark,
                                  ),
                                ),
                                const SizedBox(height: 8),

                                // Input Box
                                Container(
                                  decoration: BoxDecoration(
                                    color: AppColors.cardSurface,
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(color: AppColors.subtleBorder),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withOpacity(0.02),
                                        blurRadius: 6,
                                        offset: const Offset(0, 2),
                                      ),
                                    ],
                                  ),
                                  child: TextFormField(
                                    controller: _mobileController,
                                    keyboardType: TextInputType.phone,
                                    inputFormatters: [
                                      FilteringTextInputFormatter.digitsOnly,
                                      LengthLimitingTextInputFormatter(10),
                                    ],
                                    style: GoogleFonts.plusJakartaSans(
                                      fontSize: 15.5,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.primaryDark,
                                      letterSpacing: 0.8,
                                    ),
                                    decoration: InputDecoration(
                                      border: InputBorder.none,
                                      enabledBorder: InputBorder.none,
                                      focusedBorder: InputBorder.none,
                                      errorBorder: InputBorder.none,
                                      focusedErrorBorder: InputBorder.none,
                                      contentPadding: const EdgeInsets.symmetric(vertical: 14),
                                      prefixIcon: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          const SizedBox(width: 12),
                                          const Icon(
                                            Icons.phone_android_rounded,
                                            color: AppColors.mutedSage,
                                            size: 20,
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            '+91',
                                            style: GoogleFonts.plusJakartaSans(
                                              fontWeight: FontWeight.w700,
                                              fontSize: 15,
                                              color: AppColors.primaryDark,
                                            ),
                                          ),
                                          const SizedBox(width: 2),
                                          const Icon(
                                            Icons.keyboard_arrow_down_rounded,
                                            color: AppColors.secondaryText,
                                            size: 18,
                                          ),
                                          Container(
                                            height: 20,
                                            width: 1,
                                            color: AppColors.subtleBorder,
                                            margin: const EdgeInsets.symmetric(horizontal: 10),
                                          ),
                                        ],
                                      ),
                                      hintText: 'Enter 10-digit number',
                                      hintStyle: GoogleFonts.plusJakartaSans(
                                        color: AppColors.secondaryText,
                                        fontSize: 14,
                                        fontWeight: FontWeight.w400,
                                        letterSpacing: 0,
                                      ),
                                      counterText: '',
                                    ),
                                    validator: (value) {
                                      if (value == null || value.trim().length != 10) {
                                        return 'Please enter a valid 10-digit mobile number';
                                      }
                                      return null;
                                    },
                                  ),
                                ),
                                const SizedBox(height: 18),

                                // Animated Spring Button
                                AnimatedSpringButton(
                                  text: 'Get Verification OTP',
                                  onPressed: _isLoading ? null : _handleSendOtp,
                                  isLoading: _isLoading,
                                  height: 52,
                                  borderRadius: 26,
                                  backgroundColor: AppColors.primaryDark,
                                ),
                                const SizedBox(height: 18),

                                // Subtle "or" Divider Line
                                Row(
                                  children: [
                                    Expanded(
                                      child: Container(height: 1, color: AppColors.subtleBorder),
                                    ),
                                    Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: 10),
                                      child: Text(
                                        'or',
                                        style: GoogleFonts.plusJakartaSans(
                                          fontSize: 12,
                                          color: AppColors.secondaryText,
                                          fontWeight: FontWeight.w400,
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      child: Container(height: 1, color: AppColors.subtleBorder),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 14),

                                // Trouble Signing In Action Row with hover & spring animation
                                _AnimatedSupportLink(
                                  onTap: _showTroubleSigningInDialog,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 28),

                    // 5. Footer Copyright
                    Text(
                      '© 2026 TheNexOpp Private Limited\nAll rights reserved.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: const Color(0xFF6B7280),
                        fontWeight: FontWeight.w400,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 10),
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

class _AnimatedSupportLink extends StatefulWidget {
  final VoidCallback onTap;

  const _AnimatedSupportLink({required this.onTap});

  @override
  State<_AnimatedSupportLink> createState() => _AnimatedSupportLinkState();
}

class _AnimatedSupportLinkState extends State<_AnimatedSupportLink> {
  bool _isHovered = false;
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTapDown: (_) => setState(() => _isPressed = true),
        onTapUp: (_) => setState(() => _isPressed = false),
        onTapCancel: () => setState(() => _isPressed = false),
        onTap: widget.onTap,
        child: AnimatedScale(
          scale: _isPressed ? 0.97 : 1.0,
          duration: const Duration(milliseconds: 120),
          curve: Curves.easeOut,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: _isHovered ? const Color(0xFFF0FDF4) : Colors.transparent,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.headset_mic_outlined,
                  color: Color(0xFF059669),
                  size: 19,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Trouble signing in?',
                    style: GoogleFonts.inter(
                      color: _isHovered ? const Color(0xFF047857) : const Color(0xFF111827),
                      fontWeight: FontWeight.w600,
                      fontSize: 13.5,
                    ),
                  ),
                ),
                AnimatedSlide(
                  duration: const Duration(milliseconds: 200),
                  offset: _isHovered ? const Offset(0.25, 0) : Offset.zero,
                  child: Icon(
                    Icons.arrow_forward_rounded,
                    color: _isHovered ? const Color(0xFF047857) : const Color(0xFF9CA3AF),
                    size: 17,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
