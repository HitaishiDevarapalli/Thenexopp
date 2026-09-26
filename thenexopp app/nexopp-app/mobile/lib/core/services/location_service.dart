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
    final details = await fetchLiveLocationDetails();
    if (details != null && details['formattedAddress'] != null) {
      return details['formattedAddress'];
    }
    return null;
  }

  /// Obtains current device GPS coordinates with high accuracy and returns structured location data map
  Future<Map<String, String>?> fetchLiveLocationDetails() async {
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
          // Priority for locality: specific neighborhood/colony/suburb before coarse city_district
          final locality = (address['suburb'] ??
                  address['neighbourhood'] ??
                  address['residential'] ??
                  address['quarter'] ??
                  address['road'] ??
                  address['building'] ??
                  address['hamlet'] ??
                  address['city_district'] ??
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

          final formattedAddress = parts.isNotEmpty
              ? parts.join(', ')
              : (data['display_name'] ?? '$lat, $lon').toString();

          final fullAddressDetails = (data['display_name'] ?? formattedAddress).toString();

          return {
            'area': locality.isNotEmpty ? locality : (city.isNotEmpty ? city : 'Local Area'),
            'address': fullAddressDetails,
            'formattedAddress': formattedAddress,
            'city': city,
            'state': state,
            'pincode': postcode,
            'latitude': lat.toStringAsFixed(6),
            'longitude': lon.toStringAsFixed(6),
          };
        }

        final displayName = (data['display_name'] ?? '$lat, $lon').toString();
        return {
          'area': displayName.split(', ').first,
          'address': displayName,
          'formattedAddress': displayName,
          'city': '',
          'state': '',
          'pincode': '',
          'latitude': lat.toStringAsFixed(6),
          'longitude': lon.toStringAsFixed(6),
        };
      }
    } catch (_) {}

    return null;
  }

  /// Searches area/location suggestions across India using Nominatim OpenStreetMap API
  Future<List<Map<String, String>>> searchAreaSuggestions(String query) async {
    if (query.trim().length < 2) return [];
    try {
      final encodedQuery = Uri.encodeComponent('${query.trim()}, India');
      final url = 'https://nominatim.openstreetmap.org/search?format=json&q=$encodedQuery&countrycodes=in&addressdetails=1&limit=8';
      final response = await _dio.get(url);

      if (response.statusCode == 200 && response.data is List) {
        final List results = response.data;
        final List<Map<String, String>> suggestions = [];

        for (final item in results) {
          if (item is Map) {
            final address = item['address'] ?? {};
            final locality = (address['suburb'] ??
                    address['neighbourhood'] ??
                    address['residential'] ??
                    address['quarter'] ??
                    address['road'] ??
                    address['city_district'] ??
                    item['name'] ??
                    '').toString().trim();

            final city = (address['city'] ??
                    address['town'] ??
                    address['village'] ??
                    address['county'] ??
                    '').toString().trim();

            final state = (address['state'] ?? '').toString().trim();
            final postcode = (address['postcode'] ?? '').toString().trim();
            final displayName = (item['display_name'] ?? '').toString();

            suggestions.add({
              'area': locality.isNotEmpty ? locality : (city.isNotEmpty ? city : query),
              'address': displayName,
              'city': city,
              'state': state,
              'pincode': postcode,
              'lat': (item['lat'] ?? '').toString(),
              'lon': (item['lon'] ?? '').toString(),
            });
          }
        }
        return suggestions;
      }
    } catch (_) {}
    return [];
  }
}
