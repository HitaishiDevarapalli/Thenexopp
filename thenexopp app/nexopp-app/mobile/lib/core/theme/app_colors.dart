import 'package:flutter/material.dart';

class AppColors {
  // --- New Premium Color System (Inspired by Reference Design) ---
  // Primary Background (Warm Off-White / Linen)
  static const Color primaryBg = Color(0xFFF7F6F2);
  // Secondary Background (Warm Surface / Pill Inactive)
  static const Color secondaryBg = Color(0xFFEFEDE7);
  // Primary Dark (Charcoal / Active Buttons / Primary Text)
  static const Color primaryDark = Color(0xFF1F211F);
  static const Color charcoal = primaryDark;
  // Secondary Text (Muted Gray-Green)
  static const Color secondaryText = Color(0xFF73756F);
  // Premium Muted Sage (Accent Highlights / Selected State)
  static const Color mutedSage = Color(0xFF687762);
  static const Color sageGreen = mutedSage;
  // Light Sage (Pill Highlights / Subtle Badges)
  static const Color lightSage = Color(0xFFDDE3DA);
  // Warm Beige (Borders / Warm Chips / Neutral Dividers)
  static const Color warmBeige = Color(0xFFE8E2D8);
  // Card Surface (Pure White Elevated Components)
  static const Color cardSurface = Color(0xFFFFFFFF);
  // Subtle Border (Hairline Outlines)
  static const Color subtleBorder = Color(0xFFE3E1DA);

  // --- Aliases for Seamless Codebase Compatibility ---
  static const Color backgroundLight = primaryBg;
  static const Color warmLinen = primaryBg;
  static const Color warmCream = secondaryBg;
  static const Color warmSand = warmBeige;

  static const Color obsidianBlack = primaryDark;
  static const Color obsidianBlackDark = Color(0xFF141614);
  static const Color obsidianBlackLight = Color(0xFF2C2F2C);
  static const Color obsidianSurface = Color(0xFF252825);

  static const Color textDark = primaryDark;
  static const Color textMedium = secondaryText;
  static const Color textLight = Color(0xFF9EA099);
  static const Color textMuted = Color(0xFFB5B7AF);
  static const Color textWhite = Colors.white;

  // Primary & Accents
  static const Color primaryNavy = primaryDark;
  static const Color primaryNavyDark = Color(0xFF141614);
  static const Color primaryNavyLight = Color(0xFF333833);
  static const Color primaryNavySurface = primaryBg;

  static const Color primaryEmerald = mutedSage;
  static const Color primaryEmeraldLight = lightSage;
  static const Color primaryEmeraldDark = Color(0xFF4F5C4B);
  static const Color emeraldSurface = Color(0xFFF2F5F0);
  static const Color emeraldBorder = lightSage;

  static const Color secondaryGreen = mutedSage;
  static const Color secondaryGreenDark = Color(0xFF4F5C4B);
  static const Color secondaryGreenLight = Color(0xFFF2F5F0);
  static const Color secondaryGreenBorder = lightSage;

  static const Color champagneGold = Color(0xFFC2A782);
  static const Color champagneGoldLight = Color(0xFFFAF6EE);
  static const Color champagneGoldDark = Color(0xFF9A805D);
  static const Color accentGold = Color(0xFFC2A782);
  static const Color accentGoldDark = Color(0xFF9A805D);
  static const Color accentGoldLight = Color(0xFFFAF6EE);
  static const Color accentGoldBorder = Color(0xFFE5D8C7);

  // Status Colors
  static const Color statusSuccess = Color(0xFF52794D);
  static const Color statusWarning = Color(0xFFC4883A);
  static const Color statusError = Color(0xFFD64545);
  static const Color statusInfo = Color(0xFF4A7C9B);

  // Borders & Inputs
  static const Color borderLight = subtleBorder;
  static const Color borderSubtle = Color(0xFFECEAE2);
  static const Color inputFill = Color(0xFFFFFFFF);
  static const Color inputFillSubtle = secondaryBg;

  // Glassmorphism
  static const Color glassFill = Color(0xE6FFFFFF);
  static const Color glassFillSubtle = Color(0xAAFFFFFF);
  static const Color glassFillDark = Color(0xD91F211F);
  static const Color glassBorder = Color(0x66FFFFFF);
  static const Color glassBorderDark = Color(0x26FFFFFF);
}

