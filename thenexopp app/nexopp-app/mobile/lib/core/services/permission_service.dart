import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import '../theme/app_colors.dart';

class PermissionService {
  static Future<bool> checkAndRequestCameraPermission(
      BuildContext context) async {
    if (kIsWeb) return true;
    try {
      PermissionStatus status = await Permission.camera.status;
      if (status.isGranted) return true;

      if (status.isPermanentlyDenied) {
        if (!context.mounted) return false;
        _showOpenSettingsDialog(context, 'Camera Permission Required',
            'Camera access is required to take profile and document photos. Please enable Camera permission in app settings.');
        return false;
      }

      status = await Permission.camera.request();
      return status.isGranted;
    } catch (_) {
      return true;
    }
  }

  static Future<bool> checkAndRequestLocationPermission(
      BuildContext context) async {
    if (kIsWeb) return true;
    try {
      PermissionStatus status = await Permission.location.status;
      if (status.isGranted) return true;

      if (status.isPermanentlyDenied) {
        if (!context.mounted) return false;
        _showOpenSettingsDialog(context, 'Location Permission Required',
            'GPS Location access is required to detect your operating area and property locations. Please enable Location permission in app settings.');
        return false;
      }

      status = await Permission.location.request();
      return status.isGranted;
    } catch (_) {
      return true;
    }
  }

  static Future<bool> checkAndRequestNotificationPermission(
      BuildContext context) async {
    if (kIsWeb) return true;
    try {
      PermissionStatus status = await Permission.notification.status;
      if (status.isGranted) return true;

      status = await Permission.notification.request();
      return status.isGranted;
    } catch (_) {
      return true;
    }
  }

  /// Proactively request all required operational permissions for the agent app
  static Future<void> requestAllAppPermissions(BuildContext context) async {
    if (kIsWeb) return;
    try {
      // 1. Notifications for real-time approvals & payouts
      await Permission.notification.request();

      // 2. Location for OpenStreetMap GPS area detection
      await Permission.location.request();

      // 3. Camera for capturing property & KYC photos
      await Permission.camera.request();

      // Gallery selection is handled by image_picker's system picker. Never
      // request photo-library or shared-storage access for user-picked files.
    } catch (_) {}
  }

  static void _showOpenSettingsDialog(
      BuildContext context, String title, String message) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(title,
            style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
                color: AppColors.textDark)),
        content: Text(message,
            style: const TextStyle(
                color: AppColors.textMedium, fontSize: 14, height: 1.4)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel',
                style: TextStyle(color: AppColors.textMedium)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              openAppSettings();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryNavy,
              minimumSize: const Size(120, 42),
            ),
            child: const Text('Open Settings'),
          ),
        ],
      ),
    );
  }
}
