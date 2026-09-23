import 'package:dio/dio.dart';
import 'package:geolocator/geolocator.dart';

class LocationService {
  final Dio _dio = Dio(BaseOptions(
    connectTimeout: const Duration(seconds: 12),
    receiveTimeout: const Duration(seconds: 12),
    headers: {
      'User-Agent': 'TheNexoppAgentApp/1.0 (contact@thenexopp.com)',
      'Accept': 'application/json',
    },
  ));

  /// Obtains current device GPS coordinates with high accuracy and reverse-geocodes via OpenStreetMap Nominatim
  Future<String?> fetchLiveOpenStreetMapLocation() async {
    try {
      // 1. Check if location services (GPS hardware) are enabled on the device
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        await Geolocator.openLocationSettings();
        serviceEnabled = await Geolocator.isLocationServiceEnabled();
        if (!serviceEnabled) return null;
      }

      // 2. Check and request location permissions
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

      // 3. Multi-tier GPS acquisition: High Accuracy -> Medium Accuracy -> Last Known Position
      Position? position;
      try {
        position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
          timeLimit: const Duration(seconds: 10),
        );
      } catch (_) {
        try {
          position = await Geolocator.getCurrentPosition(
            desiredAccuracy: LocationAccuracy.medium,
            timeLimit: const Duration(seconds: 5),
          );
        } catch (_) {
          position = await Geolocator.getLastKnownPosition();
        }
      }

      if (position == null) return null;

      final lat = position.latitude;
      final lon = position.longitude;

      // 4. Reverse-geocode via OpenStreetMap Nominatim API with detailed address parameters
      final url = 'https://nominatim.openstreetmap.org/reverse?format=json&lat=$lat&lon=$lon&zoom=18&addressdetails=1';
      final response = await _dio.get(url);

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        final address = data['address'];

        if (address is Map) {
          final locality = (address['suburb'] ??
                  address['neighbourhood'] ??
                  address['residential'] ??
                  address['quarter'] ??
                  address['city_district'] ??
                  address['road'] ??
                  address['building'] ??
                  address['hamlet'] ??
                  '').toString().trim();

          final city = (address['city'] ??
                  address['town'] ??
                  address['village'] ??
                  address['county'] ??
                  address['state_district'] ??
                  '').toString().trim();

          final state = (address['state'] ?? '').toString().trim();
          final postcode = (address['postcode'] ?? '').toString().trim();

          final parts = <String>[];
          if (locality.isNotEmpty) parts.add(locality);
          if (city.isNotEmpty && city != locality) parts.add(city);
          if (state.isNotEmpty) {
            if (postcode.isNotEmpty) {
              parts.add('$state $postcode');
            } else {
              parts.add(state);
            }
          }

          if (parts.isNotEmpty) {
            return parts.join(', ');
          }
        }

        // Fallback to OSM display_name if structured fields are missing
        if (data['display_name'] != null && data['display_name'].toString().isNotEmpty) {
          final displayName = data['display_name'].toString();
          final segments = displayName.split(', ').take(4).join(', ');
          return segments;
        }

        return '${lat.toStringAsFixed(5)}, ${lon.toStringAsFixed(5)}';
      }
    } catch (_) {}

    return null;
  }
}
