import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../shared/providers/auth_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  Timer? _autoSlideTimer;

  final List<String> _stepImages = [
    'assets/images/onboarding_step_1.png',
    'assets/images/onboarding_step_2.png',
    'assets/images/onboarding_step_3.png',
    'assets/images/onboarding_step_4.png',
    'assets/images/onboarding_step_5.png',
  ];

  @override
  void initState() {
    super.initState();
    _startAutoSlideTimer();
  }

  void _startAutoSlideTimer() {
    _autoSlideTimer?.cancel();
    _autoSlideTimer = Timer.periodic(const Duration(milliseconds: 3800), (timer) {
      if (!mounted) return;
      if (_pageController.hasClients) {
        final nextPage = (_currentPage + 1) % _stepImages.length;
        _pageController.animateToPage(
          nextPage,
          duration: const Duration(milliseconds: 600),
          curve: Curves.easeInOutCubic,
        );
      }
    });
  }

  void _onPageChanged(int index) {
    setState(() {
      _currentPage = index;
    });
  }

  void _navigateToLogin() {
    HapticFeedback.mediumImpact();
    _autoSlideTimer?.cancel();
    final authState = ref.read(authProvider);
    if (authState.status == AuthStatus.authenticated) {
      final agentState = authState.agentState ?? 'APPROVED';
      switch (agentState) {
        case 'NEW':
        case 'PROFILE_INCOMPLETE':
          context.go('/onboarding/profile');
          break;
        case 'KYC_INCOMPLETE':
          context.go('/onboarding/kyc');
          break;
        case 'BANK_DETAILS_INCOMPLETE':
          context.go('/onboarding/bank');
          break;
        case 'PENDING_APPROVAL':
          context.go('/pending-approval');
          break;
        case 'REJECTED':
          context.go('/rejected');
          break;
        case 'SUSPENDED':
          context.go('/suspended');
          break;
        case 'APPROVED':
        default:
          context.go('/home');
          break;
      }
    } else {
      context.go('/login');
    }
  }

  @override
  void dispose() {
    _autoSlideTimer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: Stack(
            fit: StackFit.expand,
            children: [
              // 1. Full Edge-to-Edge Carousel Area with Zero Gaps
              Positioned.fill(
                child: PageView.builder(
                  controller: _pageController,
                  padEnds: false,
                  clipBehavior: Clip.hardEdge,
                  physics: const ClampingScrollPhysics(),
                  onPageChanged: _onPageChanged,
                  itemCount: _stepImages.length,
                  itemBuilder: (context, index) {
                    return GestureDetector(
                      onTapDown: (_) => _autoSlideTimer?.cancel(),
                      onTapUp: (_) => _startAutoSlideTimer(),
                      child: Container(
                        width: double.infinity,
                        height: double.infinity,
                        color: Colors.white,
                        child: Image.asset(
                          _stepImages[index],
                          fit: BoxFit.cover,
                          alignment: Alignment.topCenter,
                          width: double.infinity,
                          height: double.infinity,
                        ),
                      ),
                    );
                  },
                ),
              ),

              // 2. Bottom Controls Overlay with Smooth Backdrop and Zero Interference
              Positioned(
                left: 0,
                right: 0,
                bottom: 0,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.white.withOpacity(0.0),
                        Colors.white.withOpacity(0.75),
                        Colors.white.withOpacity(0.98),
                        Colors.white,
                      ],
                      stops: const [0.0, 0.35, 0.70, 1.0],
                    ),
                  ),
                  child: SafeArea(
                    top: false,
                    bottom: true,
                    child: Padding(
                      padding: const EdgeInsets.only(top: 24, bottom: 16),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // 2a. Animated 5-Dot Indicator
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: List.generate(_stepImages.length, (index) {
                              final isSelected = _currentPage == index;
                              return GestureDetector(
                                onTap: () {
                                  _pageController.animateToPage(
                                    index,
                                    duration: const Duration(milliseconds: 350),
                                    curve: Curves.easeInOutCubic,
                                  );
                                },
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 250),
                                  curve: Curves.easeOutCubic,
                                  margin: const EdgeInsets.symmetric(horizontal: 3.5),
                                  width: isSelected ? 24 : 7,
                                  height: 7,
                                  decoration: BoxDecoration(
                                    color: isSelected ? const Color(0xFF1B5E3C) : const Color(0xFFD1D5DB),
                                    borderRadius: BorderRadius.circular(4),
                                    boxShadow: isSelected
                                        ? [
                                            BoxShadow(
                                              color: const Color(0xFF1B5E3C).withOpacity(0.3),
                                              blurRadius: 4,
                                              offset: const Offset(0, 1),
                                            ),
                                          ]
                                        : null,
                                  ),
                                ),
                              );
                            }),
                          ),

                          const SizedBox(height: 18),

                          // 2b. Interactive "Swipe to Start" Capsule Slider
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 20),
                            child: SwipeToStartSlider(
                              onSwipeComplete: _navigateToLogin,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// A custom Swipe-to-Start slider designed specifically for TheNexopp Agent.
/// - Initial state: "Get Started" with green circular handle & white → arrow on the left
/// - During swipe: "Swipe to Start →" moving and revealing as handle is dragged left-to-right
/// - After successful swipe: "Starting…" then smoothly navigates to Login
class SwipeToStartSlider extends StatefulWidget {
  final VoidCallback onSwipeComplete;

  const SwipeToStartSlider({
    super.key,
    required this.onSwipeComplete,
  });

  @override
  State<SwipeToStartSlider> createState() => _SwipeToStartSliderState();
}

class _SwipeToStartSliderState extends State<SwipeToStartSlider>
    with TickerProviderStateMixin {
  // 0.0 = at rest on the left, 1.0 = fully swiped to the right
  double _progress = 0.0;
  bool _isDragging = false;
  bool _hasTriggeredHaptic = false;
  bool _isCompleted = false;

  late AnimationController _resetController;
  late Animation<double> _resetAnimation;

  late AnimationController _nudgeController;
  late Animation<double> _nudgeAnimation;

  late AnimationController _chevronController;
  late Animation<double> _chevronAnimation;

  static const double _buttonHeight = 54.0;
  static const double _handleSize = 44.0;
  static const double _padding = 4.0;
  static const Color _primaryGreen = Color(0xFF1B5E3C);

  @override
  void initState() {
    super.initState();

    _resetController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );

    _nudgeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 550),
    );

    _nudgeAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween(begin: 0.0, end: 26.0).chain(CurveTween(curve: Curves.easeOutCubic)),
        weight: 30,
      ),
      TweenSequenceItem(
        tween: Tween(begin: 26.0, end: 0.0).chain(CurveTween(curve: Curves.easeInOutCubic)),
        weight: 30,
      ),
      TweenSequenceItem(
        tween: Tween(begin: 0.0, end: 12.0).chain(CurveTween(curve: Curves.easeOutCubic)),
        weight: 20,
      ),
      TweenSequenceItem(
        tween: Tween(begin: 12.0, end: 0.0).chain(CurveTween(curve: Curves.easeInCubic)),
        weight: 20,
      ),
    ]).animate(_nudgeController)
      ..addListener(() {
        if (!_isDragging && !_resetController.isAnimating) {
          setState(() {});
        }
      });

    _chevronController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);

    _chevronAnimation = Tween<double>(begin: 0.25, end: 0.85).animate(
      CurvedAnimation(parent: _chevronController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _resetController.dispose();
    _nudgeController.dispose();
    _chevronController.dispose();
    super.dispose();
  }

  String _getLabelText(double progress) {
    if (_isCompleted) {
      return 'Starting…';
    }
    if (_isDragging || progress > 0.06) {
      return 'Swipe to Start →';
    }
    return 'Get Started';
  }

  void _onHorizontalDragStart(DragStartDetails details) {
    if (_isCompleted) return;
    _resetController.stop();
    _nudgeController.stop();
    setState(() {
      _isDragging = true;
    });
  }

  void _onHorizontalDragUpdate(DragUpdateDetails details, double maxDragDistance) {
    if (_isCompleted || maxDragDistance <= 0) return;

    // Dragging left to right: moving right (positive primaryDelta) increases progress
    final double deltaX = details.primaryDelta ?? 0.0;
    final double deltaProgress = deltaX / maxDragDistance;

    final double newProgress = (_progress + deltaProgress).clamp(0.0, 1.0);

    if (newProgress >= 0.72 && !_hasTriggeredHaptic) {
      _hasTriggeredHaptic = true;
      HapticFeedback.mediumImpact();
    } else if (newProgress < 0.72) {
      _hasTriggeredHaptic = false;
    }

    setState(() {
      _progress = newProgress;
    });
  }

  void _onHorizontalDragEnd(DragEndDetails details, double maxDragDistance) {
    if (_isCompleted) return;
    setState(() {
      _isDragging = false;
    });

    if (_progress >= 0.70) {
      _completeSwipe();
    } else {
      _animateToStart();
    }
  }

  void _onHorizontalDragCancel() {
    if (_isCompleted) return;
    setState(() {
      _isDragging = false;
    });
    _animateToStart();
  }

  void _completeSwipe() {
    setState(() {
      _isCompleted = true;
      _hasTriggeredHaptic = true;
    });
    HapticFeedback.heavyImpact();

    _resetAnimation = Tween<double>(begin: _progress, end: 1.0).animate(
      CurvedAnimation(parent: _resetController, curve: Curves.easeOutCubic),
    )..addListener(() {
        setState(() {
          _progress = _resetAnimation.value;
        });
      });

    _resetController.duration = const Duration(milliseconds: 200);
    _resetController.forward(from: 0.0).then((_) {
      // Display "Starting…" cleanly before navigation
      Future.delayed(const Duration(milliseconds: 300), () {
        if (mounted) {
          widget.onSwipeComplete();
        }
      });
    });
  }

  void _animateToStart() {
    _resetAnimation = Tween<double>(begin: _progress, end: 0.0).animate(
      CurvedAnimation(parent: _resetController, curve: Curves.easeOutCubic),
    )..addListener(() {
        setState(() {
          _progress = _resetAnimation.value;
        });
      });

    _resetController.duration = const Duration(milliseconds: 260);
    _resetController.forward(from: 0.0);
  }

  void _onTap() {
    if (_isCompleted || _isDragging || _resetController.isAnimating) return;
    HapticFeedback.selectionClick();
    _nudgeController.forward(from: 0.0);
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final double totalWidth = constraints.maxWidth;
        final double maxDragDistance = totalWidth - _handleSize - (_padding * 2);

        // Add nudge offset if active and not dragging
        final double nudgeOffset = (_nudgeController.isAnimating && !_isDragging)
            ? _nudgeAnimation.value / (maxDragDistance > 0 ? maxDragDistance : 1.0)
            : 0.0;
        final double effectiveProgress = (_progress + nudgeOffset).clamp(0.0, 1.0);

        // Calculate positions
        // Handle starts at left: left offset = padding + (maxDragDistance * progress)
        final double handleLeft = _padding + (maxDragDistance * effectiveProgress);
        // Green fill grows from the left: width = padding + handleSize + (maxDragDistance * progress)
        final double fillWidth = (_handleSize + (_padding * 2)) + (maxDragDistance * effectiveProgress);

        // Text horizontal slide: slides smoothly rightwards as handle drags across
        final double textSlideOffset = 22.0 * effectiveProgress;
        final String currentLabel = _getLabelText(effectiveProgress);

        return MouseRegion(
          cursor: _isDragging ? SystemMouseCursors.grabbing : SystemMouseCursors.grab,
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: _onTap,
            onHorizontalDragStart: _onHorizontalDragStart,
            onHorizontalDragUpdate: (details) => _onHorizontalDragUpdate(details, maxDragDistance),
            onHorizontalDragEnd: (details) => _onHorizontalDragEnd(details, maxDragDistance),
            onHorizontalDragCancel: _onHorizontalDragCancel,
            child: Container(
              height: _buttonHeight,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(30),
                border: Border.all(
                  color: _primaryGreen,
                  width: 1.8,
                ),
                boxShadow: [
                  BoxShadow(
                    color: _primaryGreen.withOpacity(0.14),
                    blurRadius: 14,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(28),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Layer 1: Base Text & Direction Hints (Green text on White BG)
                    Positioned.fill(
                      child: Padding(
                        padding: const EdgeInsets.only(left: 60, right: 20),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Transform.translate(
                              offset: Offset(textSlideOffset, 0),
                              child: AnimatedSwitcher(
                                duration: const Duration(milliseconds: 150),
                                child: Text(
                                  currentLabel,
                                  key: ValueKey('base_$currentLabel'),
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 15.5,
                                    fontWeight: FontWeight.w700,
                                    color: _primaryGreen,
                                    letterSpacing: 0.2,
                                  ),
                                ),
                              ),
                            ),
                            // Animated swipe direction hints (>>> pointing right)
                            if (!_isCompleted && effectiveProgress < 0.55)
                              AnimatedBuilder(
                                animation: _chevronAnimation,
                                builder: (context, _) {
                                  final opacity = _chevronAnimation.value * (1.0 - (effectiveProgress / 0.55));
                                  return Opacity(
                                    opacity: opacity.clamp(0.0, 1.0),
                                    child: const Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(Icons.chevron_right_rounded, size: 18, color: _primaryGreen),
                                        Icon(Icons.chevron_right_rounded, size: 18, color: _primaryGreen),
                                      ],
                                    ),
                                  );
                                },
                              ),
                          ],
                        ),
                      ),
                    ),

                    // Layer 2: Progressive Green Fill from Left to Right (revealing White Text)
                    Positioned(
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: fillWidth.clamp(0.0, totalWidth),
                      child: Container(
                        decoration: BoxDecoration(
                          color: _primaryGreen,
                          borderRadius: BorderRadius.circular(28),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(28),
                          child: Stack(
                            children: [
                              // White Text layer revealed as green fill sweeps across
                              Positioned(
                                left: 60 + textSlideOffset,
                                top: 0,
                                bottom: 0,
                                child: Center(
                                  child: AnimatedSwitcher(
                                    duration: const Duration(milliseconds: 150),
                                    child: Text(
                                      currentLabel,
                                      key: ValueKey('fill_$currentLabel'),
                                      style: GoogleFonts.plusJakartaSans(
                                        fontSize: 15.5,
                                        fontWeight: FontWeight.w700,
                                        color: Colors.white,
                                        letterSpacing: 0.2,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),

                    // Layer 3: Draggable Green Circular Handle with White Arrow
                    Positioned(
                      left: handleLeft,
                      top: _padding,
                      child: Container(
                        width: _handleSize,
                        height: _handleSize,
                        decoration: BoxDecoration(
                          color: _primaryGreen,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: Colors.white.withOpacity(0.35),
                            width: 1.5,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.22),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Center(
                          child: _isCompleted
                              ? const Icon(
                                  Icons.check_rounded,
                                  color: Colors.white,
                                  size: 22,
                                )
                              : const Icon(
                                  Icons.arrow_forward_rounded,
                                  color: Colors.white,
                                  size: 20,
                                ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}



