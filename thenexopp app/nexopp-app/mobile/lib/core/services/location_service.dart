import 'package:dio/dio.dart';
import 'package:geolocator/geolocator.dart';

class LocationService {
  final Dio _dio = Dio(BaseOptions(
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {
      'User-Agent': 'TheNexoppAgentApp/1.0 (contact@thenexopp.com)',
    },
  ));

  Future<String?> fetchLiveOpenStreetMapLocation() async {
    try {
      // 1. Check if location services (GPS hardware) are enabled
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        // Prompt device location settings
        await Geolocator.openLocationSettings();
        serviceEnabled = await Geolocator.isLocationServiceEnabled();
        if (!serviceEnabled) return null;
      }

      // 2. Check and request app location permissions
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return null;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        await Geolocator.openAppSettings();
        return null;
      }

      // 3. Obtain current coordinates with fallback to last known
      Position? position;
      try {
        position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.medium,
          timeLimit: const Duration(seconds: 7),
        );
      } catch (_) {
        position = await Geolocator.getLastKnownPosition();
      }

      if (position == null) return null;

      final lat = position.latitude;
      final lon = position.longitude;

      // 4. Reverse-geocode via OpenStreetMap Nominatim API
      final url = 'https://nominatim.openstreetmap.org/reverse?format=json&lat=$lat&lon=$lon&zoom=18&addressdetails=1';
      final response = await _dio.get(url);

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        final address = data['address'];
        if (address is Map) {
          final locality = address['suburb'] ??
              address['neighbourhood'] ??
              address['residential'] ??
              address['road'] ??
              address['hamlet'] ??
              '';
          final city = address['city'] ??
              address['town'] ??
              address['village'] ??
              address['county'] ??
              address['state_district'] ??
              '';
          final state = address['state'] ?? '';

          final parts = [locality, city, state]
              .where((p) => p.toString().trim().isNotEmpty)
              .toSet()
              .toList();

          if (parts.isNotEmpty) {
            return parts.join(', ');
          }
        }
        return data['display_name']?.toString() ?? '$lat, $lon';
      }
    } catch (_) {}

    return null;
  }
}

