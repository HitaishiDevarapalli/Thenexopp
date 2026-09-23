import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import '../constants/api_constants.dart';
import '../theme/app_colors.dart';

/// Helper to normalize and resolve any image URL or image object from the backend
String? resolveImageUrl(dynamic imageSource, {String bucket = 'property-images'}) {
  if (imageSource == null) return null;

  String? rawUrl;

  if (imageSource is Map) {
    rawUrl = imageSource['url']?.toString() ??
        imageSource['viewUrl']?.toString() ??
        imageSource['imageUrl']?.toString();

    if ((rawUrl == null || rawUrl.trim().isEmpty) && imageSource['imageKey'] != null) {
      final key = imageSource['imageKey'].toString().trim();
      if (key.isNotEmpty) {
        rawUrl = '${ApiConstants.baseUrl}/uploads/local-mock-view?key=${Uri.encodeComponent(key)}&bucket=$bucket';
      }
    }
  } else if (imageSource is String) {
    rawUrl = imageSource;
  }

  if (rawUrl == null || rawUrl.trim().isEmpty) return null;
  rawUrl = rawUrl.trim();

  // 1. Data URI (Base64)
  if (rawUrl.startsWith('data:image/') || rawUrl.startsWith('data:')) {
    return rawUrl;
  }

  // 2. Relative URLs starting with '/' (e.g. /api/v2/uploads/... or /uploads/...)
  if (rawUrl.startsWith('/')) {
    try {
      final baseUri = Uri.parse(ApiConstants.baseUrl);
      final origin = '${baseUri.scheme}://${baseUri.host}${baseUri.hasPort && baseUri.port != 80 && baseUri.port != 443 ? ':${baseUri.port}' : ''}';
      return '$origin$rawUrl';
    } catch (_) {
      return 'https://thenexopp.com$rawUrl';
    }
  }

  // 3. URLs starting with http://localhost or http://127.0.0.1 (replace with active host domain on mobile)
  if (rawUrl.startsWith('http://localhost') || rawUrl.startsWith('http://127.0.0.1')) {
    try {
      final baseUri = Uri.parse(ApiConstants.baseUrl);
      final origin = '${baseUri.scheme}://${baseUri.host}${baseUri.hasPort && baseUri.port != 80 && baseUri.port != 443 ? ':${baseUri.port}' : ''}';
      final parsedRaw = Uri.parse(rawUrl);
      final pathAndQuery = '${parsedRaw.path}${parsedRaw.hasQuery ? '?${parsedRaw.query}' : ''}';
      return '$origin$pathAndQuery';
    } catch (_) {
      return rawUrl.replaceFirst(RegExp(r'http:\/\/(localhost|127\.0\.0\.1)(:\d+)?'), 'https://thenexopp.com');
    }
  }

  // 4. Absolute URL
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return rawUrl;
  }

  // 5. Bare key (e.g. "174123-uuid.jpg")
  return '${ApiConstants.baseUrl}/uploads/local-mock-view?key=${Uri.encodeComponent(rawUrl)}&bucket=$bucket';
}

/// Robust image widget that renders property/user network images, relative URLs, base64 strings, and fallback icons.
class AppNetworkImage extends StatelessWidget {
  final dynamic imageSource;
  final String bucket;
  final double? width;
  final double? height;
  final BoxFit fit;
  final BorderRadius? borderRadius;
  final Widget? placeholder;
  final Widget? errorWidget;
  final IconData fallbackIcon;
  final double fallbackIconSize;

  const AppNetworkImage({
    super.key,
    required this.imageSource,
    this.bucket = 'property-images',
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.borderRadius,
    this.placeholder,
    this.errorWidget,
    this.fallbackIcon = Icons.apartment_rounded,
    this.fallbackIconSize = 32,
  });

  @override
  Widget build(BuildContext context) {
    final resolvedUrl = resolveImageUrl(imageSource, bucket: bucket);

    Widget imageWidget;

    if (resolvedUrl == null || resolvedUrl.isEmpty) {
      imageWidget = _buildFallback();
    } else if (resolvedUrl.startsWith('data:image/') || resolvedUrl.startsWith('data:')) {
      // Decode base64 bytes
      try {
        final commaIdx = resolvedUrl.indexOf(',');
        final b64Str = commaIdx != -1 ? resolvedUrl.substring(commaIdx + 1) : resolvedUrl;
        final Uint8List bytes = base64Decode(b64Str.replaceAll(RegExp(r'\s+'), ''));
        imageWidget = Image.memory(
          bytes,
          width: width,
          height: height,
          fit: fit,
          errorBuilder: (_, __, ___) => _buildFallback(),
        );
      } catch (_) {
        imageWidget = _buildFallback();
      }
    } else {
      // Network Image
      imageWidget = Image.network(
        resolvedUrl,
        width: width,
        height: height,
        fit: fit,
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return placeholder ??
              Container(
                width: width,
                height: height,
                color: AppColors.secondaryBg,
                child: Center(
                  child: SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      value: loadingProgress.expectedTotalBytes != null
                          ? loadingProgress.cumulativeBytesLoaded / loadingProgress.expectedTotalBytes!
                          : null,
                      color: AppColors.primaryEmerald,
                    ),
                  ),
                ),
              );
        },
        errorBuilder: (_, __, ___) => _buildFallback(),
      );
    }

    if (borderRadius != null) {
      return ClipRRect(
        borderRadius: borderRadius!,
        child: imageWidget,
      );
    }

    return imageWidget;
  }

  Widget _buildFallback() {
    return errorWidget ??
        Container(
          width: width,
          height: height,
          color: AppColors.secondaryBg,
          child: Center(
            child: Icon(fallbackIcon, color: AppColors.secondaryText, size: fallbackIconSize),
          ),
        );
  }
}
