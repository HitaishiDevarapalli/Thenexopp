import 'package:dio/dio.dart';
import 'package:geolocator/geolocator.dart';

class LocationService {
  final Dio _dio = Dio(BaseOptions(
    connectTimeout: const Duration(seconds: 8),
    receiveTimeout: const Duration(seconds: 8),
    headers: {
      'User-Agent': 'TheNexoppAgentApp/1.0 (contact@thenexopp.com)',
      'Accept': 'application/json',
    },
  ));

  // Comprehensive pre-indexed database for instant local suggestions across AP & Telangana
  static final List<Map<String, String>> _predefinedLocalities = [
    // Guntur
    {'area': 'Brodipet', 'city': 'Guntur', 'state': 'Andhra Pradesh', 'address': 'Brodipet, Guntur, Andhra Pradesh'},
    {'area': 'Arundelpet', 'city': 'Guntur', 'state': 'Andhra Pradesh', 'address': 'Arundelpet, Guntur, Andhra Pradesh'},
    {'area': 'Pattabhipuram', 'city': 'Guntur', 'state': 'Andhra Pradesh', 'address': 'Pattabhipuram, Guntur, Andhra Pradesh'},
    {'area': 'Lakshmipuram', 'city': 'Guntur', 'state': 'Andhra Pradesh', 'address': 'Lakshmipuram, Guntur, Andhra Pradesh'},
    {'area': 'Kothapet', 'city': 'Guntur', 'state': 'Andhra Pradesh', 'address': 'Kothapet, Guntur, Andhra Pradesh'},
    {'area': 'Nallapadu', 'city': 'Guntur', 'state': 'Andhra Pradesh', 'address': 'Nallapadu, Guntur, Andhra Pradesh'},
    {'area': 'Amaravathi Road', 'city': 'Guntur', 'state': 'Andhra Pradesh', 'address': 'Amaravathi Road, Guntur, Andhra Pradesh'},
    {'area': 'SVN Colony', 'city': 'Guntur', 'state': 'Andhra Pradesh', 'address': 'SVN Colony, Guntur, Andhra Pradesh'},
    {'area': 'Sambasivarao Pet', 'city': 'Guntur', 'state': 'Andhra Pradesh', 'address': 'Sambasivarao Pet, Guntur, Andhra Pradesh'},
    {'area': 'Gujjanagundla', 'city': 'Guntur', 'state': 'Andhra Pradesh', 'address': 'Gujjanagundla, Guntur, Andhra Pradesh'},
    {'area': 'Koritepadu', 'city': 'Guntur', 'state': 'Andhra Pradesh', 'address': 'Koritepadu, Guntur, Andhra Pradesh'},
    {'area': 'Syamala Nagar', 'city': 'Guntur', 'state': 'Andhra Pradesh', 'address': 'Syamala Nagar, Guntur, Andhra Pradesh'},
    {'area': 'Vidyanagar', 'city': 'Guntur', 'state': 'Andhra Pradesh', 'address': 'Vidyanagar, Guntur, Andhra Pradesh'},
    {'area': 'Gorantla', 'city': 'Guntur', 'state': 'Andhra Pradesh', 'address': 'Gorantla, Guntur, Andhra Pradesh'},
    {'area': 'Tadepalle', 'city': 'Guntur', 'state': 'Andhra Pradesh', 'address': 'Tadepalle, Guntur, Andhra Pradesh'},
    {'area': 'Mangalagiri', 'city': 'Guntur', 'state': 'Andhra Pradesh', 'address': 'Mangalagiri, Guntur, Andhra Pradesh'},
    {'area': 'Old Guntur', 'city': 'Guntur', 'state': 'Andhra Pradesh', 'address': 'Old Guntur, Guntur, Andhra Pradesh'},
    {'area': 'Auto Nagar', 'city': 'Guntur', 'state': 'Andhra Pradesh', 'address': 'Auto Nagar, Guntur, Andhra Pradesh'},
    {'area': 'Chuttugunta', 'city': 'Guntur', 'state': 'Andhra Pradesh', 'address': 'Chuttugunta, Guntur, Andhra Pradesh'},

    // Hyderabad & Secunderabad
    {'area': 'Madhapur', 'city': 'Hyderabad', 'state': 'Telangana', 'address': 'Madhapur, Hitech City, Hyderabad, Telangana'},
    {'area': 'Gachibowli', 'city': 'Hyderabad', 'state': 'Telangana', 'address': 'Gachibowli, Financial District, Hyderabad, Telangana'},
    {'area': 'Jubilee Hills', 'city': 'Hyderabad', 'state': 'Telangana', 'address': 'Jubilee Hills, Hyderabad, Telangana'},
    {'area': 'Banjara Hills', 'city': 'Hyderabad', 'state': 'Telangana', 'address': 'Banjara Hills, Hyderabad, Telangana'},
    {'area': 'Hitech City', 'city': 'Hyderabad', 'state': 'Telangana', 'address': 'Hitech City, Madhapur, Hyderabad, Telangana'},
    {'area': 'Kondapur', 'city': 'Hyderabad', 'state': 'Telangana', 'address': 'Kondapur, Hyderabad, Telangana'},
    {'area': 'Kukatpally', 'city': 'Hyderabad', 'state': 'Telangana', 'address': 'Kukatpally, KPHB Colony, Hyderabad, Telangana'},
    {'area': 'Miyapur', 'city': 'Hyderabad', 'state': 'Telangana', 'address': 'Miyapur, Hyderabad, Telangana'},
    {'area': 'Ameerpet', 'city': 'Hyderabad', 'state': 'Telangana', 'address': 'Ameerpet, Hyderabad, Telangana'},
    {'area': 'Begumpet', 'city': 'Hyderabad', 'state': 'Telangana', 'address': 'Begumpet, Hyderabad, Telangana'},
    {'area': 'Secunderabad', 'city': 'Hyderabad', 'state': 'Telangana', 'address': 'Secunderabad, Telangana'},
    {'area': 'Dilsukhnagar', 'city': 'Hyderabad', 'state': 'Telangana', 'address': 'Dilsukhnagar, Hyderabad, Telangana'},
    {'area': 'LB Nagar', 'city': 'Hyderabad', 'state': 'Telangana', 'address': 'LB Nagar, Hyderabad, Telangana'},
    {'area': 'Manikonda', 'city': 'Hyderabad', 'state': 'Telangana', 'address': 'Manikonda, Puppalguda, Hyderabad, Telangana'},
    {'area': 'Financial District', 'city': 'Hyderabad', 'state': 'Telangana', 'address': 'Financial District, Nanakramguda, Gachibowli, Hyderabad, Telangana'},
    {'area': 'Tellapur', 'city': 'Hyderabad', 'state': 'Telangana', 'address': 'Tellapur, Gachibowli Extension, Hyderabad, Telangana'},
    {'area': 'Narsingi', 'city': 'Hyderabad', 'state': 'Telangana', 'address': 'Narsingi, Gandipet Road, Hyderabad, Telangana'},
    {'area': 'Hafeezpet', 'city': 'Hyderabad', 'state': 'Telangana', 'address': 'Hafeezpet, Miyapur Road, Hyderabad, Telangana'},
    {'area': 'Bachupally', 'city': 'Hyderabad', 'state': 'Telangana', 'address': 'Bachupally, Nizampet Road, Hyderabad, Telangana'},
    {'area': 'Pragathi Nagar', 'city': 'Hyderabad', 'state': 'Telangana', 'address': 'Pragathi Nagar, Kukatpally, Hyderabad, Telangana'},
    {'area': 'Somajiguda', 'city': 'Hyderabad', 'state': 'Telangana', 'address': 'Somajiguda, Raj Bhavan Road, Hyderabad, Telangana'},
    {'area': 'Punjagutta', 'city': 'Hyderabad', 'state': 'Telangana', 'address': 'Punjagutta, Hyderabad, Telangana'},
    {'area': 'Koti', 'city': 'Hyderabad', 'state': 'Telangana', 'address': 'Koti, Abids, Hyderabad, Telangana'},
    {'area': 'Mehdipatnam', 'city': 'Hyderabad', 'state': 'Telangana', 'address': 'Mehdipatnam, Hyderabad, Telangana'},
    {'area': 'Tolichowki', 'city': 'Hyderabad', 'state': 'Telangana', 'address': 'Tolichowki, Gachibowli Road, Hyderabad, Telangana'},

    // Vijayawada
    {'area': 'Benz Circle', 'city': 'Vijayawada', 'state': 'Andhra Pradesh', 'address': 'Benz Circle, Vijayawada, Andhra Pradesh'},
    {'area': 'MG Road', 'city': 'Vijayawada', 'state': 'Andhra Pradesh', 'address': 'MG Road, Labbipet, Vijayawada, Andhra Pradesh'},
    {'area': 'Governorpet', 'city': 'Vijayawada', 'state': 'Andhra Pradesh', 'address': 'Governorpet, Vijayawada, Andhra Pradesh'},
    {'area': 'Patamata', 'city': 'Vijayawada', 'state': 'Andhra Pradesh', 'address': 'Patamata, Vijayawada, Andhra Pradesh'},
    {'area': 'Bhavanipuram', 'city': 'Vijayawada', 'state': 'Andhra Pradesh', 'address': 'Bhavanipuram, Vijayawada, Andhra Pradesh'},
    {'area': 'Gunadala', 'city': 'Vijayawada', 'state': 'Andhra Pradesh', 'address': 'Gunadala, Vijayawada, Andhra Pradesh'},
    {'area': 'One Town', 'city': 'Vijayawada', 'state': 'Andhra Pradesh', 'address': 'One Town, Kaleswara Rao Market, Vijayawada, Andhra Pradesh'},

    // Visakhapatnam
    {'area': 'MVP Colony', 'city': 'Visakhapatnam', 'state': 'Andhra Pradesh', 'address': 'MVP Colony, Visakhapatnam, Andhra Pradesh'},
    {'area': 'Seethammadhara', 'city': 'Visakhapatnam', 'state': 'Andhra Pradesh', 'address': 'Seethammadhara, Visakhapatnam, Andhra Pradesh'},
    {'area': 'Gajuwaka', 'city': 'Visakhapatnam', 'state': 'Andhra Pradesh', 'address': 'Gajuwaka, Visakhapatnam, Andhra Pradesh'},
    {'area': 'Dwaraka Nagar', 'city': 'Visakhapatnam', 'state': 'Andhra Pradesh', 'address': 'Dwaraka Nagar, Visakhapatnam, Andhra Pradesh'},
    {'area': 'Madhurawada', 'city': 'Visakhapatnam', 'state': 'Andhra Pradesh', 'address': 'Madhurawada, IT SEZ, Visakhapatnam, Andhra Pradesh'},
    {'area': 'Siripuram', 'city': 'Visakhapatnam', 'state': 'Andhra Pradesh', 'address': 'Siripuram, Visakhapatnam, Andhra Pradesh'},

    // Other Cities
    {'area': 'Tirupati', 'city': 'Tirupati', 'state': 'Andhra Pradesh', 'address': 'Tirupati Main City, Andhra Pradesh'},
    {'area': 'Nellore', 'city': 'Nellore', 'state': 'Andhra Pradesh', 'address': 'Nellore Town, Andhra Pradesh'},
    {'area': 'Rajahmundry', 'city': 'Rajahmundry', 'state': 'Andhra Pradesh', 'address': 'Rajahmundry, East Godavari, Andhra Pradesh'},
    {'area': 'Kakinada', 'city': 'Kakinada', 'state': 'Andhra Pradesh', 'address': 'Kakinada, East Godavari, Andhra Pradesh'},
    {'area': 'Warangal', 'city': 'Warangal', 'state': 'Telangana', 'address': 'Warangal City, Telangana'},
    {'area': 'Karimnagar', 'city': 'Karimnagar', 'state': 'Telangana', 'address': 'Karimnagar, Telangana'},
    {'area': 'Nizamabad', 'city': 'Nizamabad', 'state': 'Telangana', 'address': 'Nizamabad, Telangana'},
  ];

  /// Obtains current device GPS coordinates with high accuracy and reverse-geocodes
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
      // 1. Check if location services (GPS hardware) are enabled
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
          timeLimit: const Duration(seconds: 8),
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

      // 4. Reverse-geocode via Nominatim API with detailed address parameters
      final url = 'https://nominatim.openstreetmap.org/reverse?format=json&lat=$lat&lon=$lon&zoom=18&addressdetails=1';
      final response = await _dio.get(url);

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        final address = data['address'];

        if (address is Map) {
          // Exhaustive locality extraction priority for Indian addresses
          final locality = (address['locality'] ??
                  address['suburb'] ??
                  address['neighbourhood'] ??
                  address['residential'] ??
                  address['colony'] ??
                  address['quarter'] ??
                  address['road'] ??
                  address['building'] ??
                  address['amenity'] ??
                  address['hamlet'] ??
                  address['city_district'] ??
                  address['county'] ??
                  '').toString().trim();

          final city = (address['city'] ??
                  address['town'] ??
                  address['village'] ??
                  address['municipality'] ??
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
      }
    } catch (_) {}

    return null;
  }

  /// Searches area/location suggestions across India with instant local matching & dual online APIs
  Future<List<Map<String, String>>> searchAreaSuggestions(String query) async {
    final cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.length < 2) return [];

    final List<Map<String, String>> suggestions = [];
    final Set<String> seenKeys = {};

    // 1. Instant local index lookup for Guntur, Hyderabad, Vijayawada, Vizag & AP/Telangana
    for (final loc in _predefinedLocalities) {
      final area = (loc['area'] ?? '').toLowerCase();
      final city = (loc['city'] ?? '').toLowerCase();
      final state = (loc['state'] ?? '').toLowerCase();
      final fullAddr = (loc['address'] ?? '').toLowerCase();

      if (area.contains(cleanQuery) ||
          city.contains(cleanQuery) ||
          state.contains(cleanQuery) ||
          fullAddr.contains(cleanQuery)) {
        final key = '${loc['area']}_${loc['city']}'.toLowerCase();
        if (!seenKeys.contains(key)) {
          seenKeys.add(key);
          suggestions.add(Map<String, String>.from(loc));
        }
      }
    }

    // 2. Dual Online Search via Photon Komoot + Nominatim OpenStreetMap APIs
    try {
      final encodedQuery = Uri.encodeComponent(query.trim());
      
      // A. Photon API (ultra-fast, excellent Indian locality matching)
      final photonUrl = 'https://photon.komoot.io/api/?q=$encodedQuery&limit=10';
      // B. Nominatim API
      final nominatimUrl = 'https://nominatim.openstreetmap.org/search?format=json&q=$encodedQuery, India&countrycodes=in&addressdetails=1&limit=10';

      final responses = await Future.wait([
        _dio.get(photonUrl).catchError((_) => Response(requestOptions: RequestOptions(path: ''), statusCode: 500)),
        _dio.get(nominatimUrl).catchError((_) => Response(requestOptions: RequestOptions(path: ''), statusCode: 500)),
      ]);

      // Parse Photon results
      final photonResp = responses[0];
      if (photonResp.statusCode == 200 && photonResp.data is Map && photonResp.data['features'] is List) {
        final List features = photonResp.data['features'];
        for (final item in features) {
          if (item is Map && item['properties'] is Map) {
            final props = item['properties'];
            final name = (props['name'] ?? '').toString().trim();
            final city = (props['city'] ?? props['district'] ?? props['county'] ?? '').toString().trim();
            final state = (props['state'] ?? '').toString().trim();
            final postcode = (props['postcode'] ?? '').toString().trim();
            final country = (props['country'] ?? '').toString();

            if (country.isEmpty || country.toLowerCase().contains('india')) {
              final area = name.isNotEmpty ? name : city;
              final parts = <String>[];
              if (area.isNotEmpty) parts.add(area);
              if (city.isNotEmpty && city != area) parts.add(city);
              if (state.isNotEmpty) parts.add(state);
              final addressStr = parts.join(', ');

              final key = '${area}_$city'.toLowerCase();
              if (area.isNotEmpty && !seenKeys.contains(key)) {
                seenKeys.add(key);
                suggestions.add({
                  'area': area,
                  'address': addressStr.isNotEmpty ? addressStr : query,
                  'city': city,
                  'state': state,
                  'pincode': postcode,
                  'lat': (item['geometry']?['coordinates']?[1] ?? '').toString(),
                  'lon': (item['geometry']?['coordinates']?[0] ?? '').toString(),
                });
              }
            }
          }
        }
      }

      // Parse Nominatim results
      final nomResp = responses[1];
      if (nomResp.statusCode == 200 && nomResp.data is List) {
        final List results = nomResp.data;
        for (final item in results) {
          if (item is Map) {
            final address = item['address'] ?? {};
            final locality = (address['locality'] ??
                    address['suburb'] ??
                    address['neighbourhood'] ??
                    address['residential'] ??
                    address['colony'] ??
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

            final area = locality.isNotEmpty ? locality : (city.isNotEmpty ? city : query);
            final key = '${area}_$city'.toLowerCase();
            if (area.isNotEmpty && !seenKeys.contains(key)) {
              seenKeys.add(key);
              suggestions.add({
                'area': area,
                'address': displayName,
                'city': city,
                'state': state,
                'pincode': postcode,
                'lat': (item['lat'] ?? '').toString(),
                'lon': (item['lon'] ?? '').toString(),
              });
            }
          }
        }
      }
    } catch (_) {}

    return suggestions;
  }
}
