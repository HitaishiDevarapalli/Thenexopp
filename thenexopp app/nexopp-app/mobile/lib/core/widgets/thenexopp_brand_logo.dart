import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class TheNexoppBrandLogo extends StatelessWidget {
  final double size;
  final bool showTagline;

  const TheNexoppBrandLogo({
    super.key,
    this.size = 110,
    this.showTagline = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // 1. Skyscraper "N" Monogram Vector
        CustomPaint(
          size: Size(size * 0.75, size * 0.9),
          painter: _SkyscraperLogoPainter(),
        ),
        const SizedBox(height: 10),

        // 2. TheNexQpp AGENT Brand Text with Swoosh
        Stack(
          clipBehavior: Clip.none,
          alignment: Alignment.center,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                Text(
                  'The',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: size * 0.32,
                    fontWeight: FontWeight.w900,
                    color: const Color(0xFFD97706), // Warm Amber / Orange Gold
                    letterSpacing: -0.5,
                  ),
                ),
                Text(
                  'Nex',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: size * 0.32,
                    fontWeight: FontWeight.w900,
                    color: const Color(0xFF047857), // Deep Emerald Green
                    letterSpacing: -0.5,
                  ),
                ),
                Text(
                  'Qpp',
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: size * 0.32,
                    fontWeight: FontWeight.w900,
                    color: const Color(0xFF047857), // Deep Emerald Green
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A), // Deep Navy Charcoal Badge
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    'AGENT',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: size * 0.11,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      letterSpacing: 1.0,
                    ),
                  ),
                ),
              ],
            ),

            // Green Swoosh Arc under TheNexQpp
            Positioned(
              bottom: -6,
              left: 2,
              right: size * 0.45,
              child: CustomPaint(
                size: Size(size * 1.2, 8),
                painter: _SwooshPainter(),
              ),
            ),
          ],
        ),

        // 3. Official Tagline: Where Next Happens
        if (showTagline) ...[
          const SizedBox(height: 14),
          Text(
            'Where Next Happens',
            style: GoogleFonts.playfairDisplay(
              fontSize: size * 0.145,
              fontWeight: FontWeight.w600,
              fontStyle: FontStyle.italic,
              color: const Color(0xFF1E293B),
              letterSpacing: 0.3,
            ),
          ),
        ],
      ],
    );
  }
}

class _SkyscraperLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    // Paints
    final spirePaint = Paint()
      ..color = const Color(0xFF047857)
      ..style = PaintingStyle.fill;

    final leftTowerPaint = Paint()
      ..color = const Color(0xFF059669)
      ..style = PaintingStyle.fill;

    final rightTowerPaint = Paint()
      ..color = const Color(0xFF047857)
      ..style = PaintingStyle.fill;

    final diagonalPaint = Paint()
      ..color = const Color(0xFF10B981)
      ..style = PaintingStyle.fill;

    final borderStroke = Paint()
      ..color = Colors.white.withOpacity(0.9)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    // 1. Center Spire / Antenna
    final spirePath = Path()
      ..moveTo(w * 0.5, 0)
      ..lineTo(w * 0.53, h * 0.22)
      ..lineTo(w * 0.47, h * 0.22)
      ..close();
    canvas.drawPath(spirePath, spirePaint);

    // 2. Left Building Column (Angled Roof)
    final leftPath = Path()
      ..moveTo(w * 0.08, h * 0.48)
      ..lineTo(w * 0.36, h * 0.36)
      ..lineTo(w * 0.36, h * 0.98)
      ..lineTo(w * 0.08, h * 0.98)
      ..close();
    canvas.drawPath(leftPath, leftTowerPaint);
    canvas.drawPath(leftPath, borderStroke);

    // 3. Right Skyscraper Tower (Tallest)
    final rightPath = Path()
      ..moveTo(w * 0.64, h * 0.22)
      ..lineTo(w * 0.92, h * 0.34)
      ..lineTo(w * 0.92, h * 0.98)
      ..lineTo(w * 0.64, h * 0.98)
      ..close();
    canvas.drawPath(rightPath, rightTowerPaint);
    canvas.drawPath(rightPath, borderStroke);

    // 4. Connecting Diagonal Beam ("N" shape)
    final diagPath = Path()
      ..moveTo(w * 0.36, h * 0.36)
      ..lineTo(w * 0.64, h * 0.52)
      ..lineTo(w * 0.64, h * 0.74)
      ..lineTo(w * 0.36, h * 0.58)
      ..close();
    canvas.drawPath(diagPath, diagonalPaint);
    canvas.drawPath(diagPath, borderStroke);

    // 5. Architectural Window Slits (Geometric accents)
    final windowPaint = Paint()
      ..color = Colors.white.withOpacity(0.35)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.2;

    // Left tower window lines
    canvas.drawLine(Offset(w * 0.16, h * 0.55), Offset(w * 0.28, h * 0.50), windowPaint);
    canvas.drawLine(Offset(w * 0.16, h * 0.68), Offset(w * 0.28, h * 0.63), windowPaint);
    canvas.drawLine(Offset(w * 0.16, h * 0.81), Offset(w * 0.28, h * 0.76), windowPaint);

    // Right tower window lines
    canvas.drawLine(Offset(w * 0.72, h * 0.42), Offset(w * 0.84, h * 0.47), windowPaint);
    canvas.drawLine(Offset(w * 0.72, h * 0.55), Offset(w * 0.84, h * 0.60), windowPaint);
    canvas.drawLine(Offset(w * 0.72, h * 0.68), Offset(w * 0.84, h * 0.73), windowPaint);
    canvas.drawLine(Offset(w * 0.72, h * 0.81), Offset(w * 0.84, h * 0.86), windowPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _SwooshPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF059669)
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 2.4;

    final path = Path()
      ..moveTo(0, size.height * 0.8)
      ..quadraticBezierTo(
        size.width * 0.4,
        size.height * 0.1,
        size.width,
        size.height * 0.7,
      );

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
