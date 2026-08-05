import fetch from 'node-fetch';

/**
 * Known Indian cities & localities fallback database for instant offline geocoding
 */
const KNOWN_LOCATIONS = [
  { keywords: ['hyderabad', 'hitec city', 'madhapur', 'gachibowli', 'j类别', 'banjara hills', 'kukatpally'], city: 'Hyderabad', state: 'Telangana', latitude: 17.3850, longitude: 78.4867, pincode: '500001' },
  { keywords: ['madhapur'], city: 'Hyderabad', state: 'Telangana', latitude: 17.4483, longitude: 78.3741, pincode: '500081' },
  { keywords: ['kukatpally'], city: 'Hyderabad', state: 'Telangana', latitude: 17.4947, longitude: 78.3996, pincode: '500072' },
  { keywords: ['banjara hills'], city: 'Hyderabad', state: 'Telangana', latitude: 17.4156, longitude: 78.4347, pincode: '500034' },
  { keywords: ['jubilee hills'], city: 'Hyderabad', state: 'Telangana', latitude: 17.4319, longitude: 78.4071, pincode: '500033' },
  { keywords: ['gachibowli'], city: 'Hyderabad', state: 'Telangana', latitude: 17.4401, longitude: 78.3489, pincode: '500032' },
  { keywords: ['guntur', 'brodipet', 'arundelpet', 'lakshmipuram', 'svn colony', 'koritepad'], city: 'Guntur', state: 'Andhra Pradesh', latitude: 16.3067, longitude: 80.4363, pincode: '522002' },
  { keywords: ['vijayawada', 'benz circle', 'patamata', 'labbipet', 'kanuru'], city: 'Vijayawada', state: 'Andhra Pradesh', latitude: 16.5062, longitude: 80.6480, pincode: '520001' },
  { keywords: ['visakhapatnam', 'vizag', 'madhurawada', 'mvp colony', 'rushikonda'], city: 'Visakhapatnam', state: 'Andhra Pradesh', latitude: 17.7400, longitude: 83.3300, pincode: '530001' },
  { keywords: ['amaravati', 'velagapudi'], city: 'Amaravati', state: 'Andhra Pradesh', latitude: 16.5131, longitude: 80.5165, pincode: '522237' },
  { keywords: ['bengaluru', 'bangalore', 'whitefield', 'koramangala'], city: 'Bengaluru', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946, pincode: '560001' },
  { keywords: ['mumbai', 'powai', 'bandra'], city: 'Mumbai', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777, pincode: '400001' },
  { keywords: ['delhi', 'new delhi', 'noida', 'gurugram'], city: 'New Delhi', state: 'Delhi', latitude: 28.6139, longitude: 77.2090, pincode: '110001' },
];

/**
 * Geocode full address string to Lat/Lng and address components
 * 1. Tries Google Geocoding API if GOOGLE_MAPS_API_KEY is present
 * 2. Falls back to OpenStreetMap Nominatim API
 * 3. Falls back to offline India Places database
 *
 * @param {string} addressInput - Address or location query entered by user/admin
 * @returns {Promise<{ latitude: number, longitude: number, city: string, state: string, pincode: string, fullAddress: string, area: string }>}
 */
export async function geocodeAddress(addressInput) {
  if (!addressInput || typeof addressInput !== 'string') {
    throw new Error('Address string is required for geocoding.');
  }

  const query = addressInput.trim();
  const lowerQuery = query.toLowerCase();

  // Step 1: Check Google Geocoding API if key configured
  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (googleApiKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${googleApiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        const location = result.geometry.location;
        const comps = result.address_components || [];
        const getComp = (type) => comps.find(c => c.types.includes(type))?.long_name || '';

        return {
          latitude: location.lat,
          longitude: location.lng,
          fullAddress: result.formatted_address || query,
          city: getComp('locality') || getComp('administrative_area_level_2') || 'Guntur',
          state: getComp('administrative_area_level_1') || 'Andhra Pradesh',
          area: getComp('sublocality_level_1') || getComp('neighborhood') || getComp('route') || '',
          pincode: getComp('postal_code') || '',
        };
      }
    } catch (err) {
      console.warn('Google Geocoding API error, falling back:', err.message);
    }
  }

  // Step 2: OpenStreetMap Nominatim API
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', India')}&limit=1&addressdetails=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'VenturoPropertyMarketplace/1.0' }
    });
    if (res.ok) {
      const results = await res.json();
      if (results && results.length > 0) {
        const item = results[0];
        const addr = item.address || {};
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);

        if (!isNaN(lat) && !isNaN(lon)) {
          return {
            latitude: lat,
            longitude: lon,
            fullAddress: item.display_name || query,
            city: addr.city || addr.town || addr.village || addr.county || 'Guntur',
            state: addr.state || 'Andhra Pradesh',
            area: addr.suburb || addr.neighbourhood || addr.residential || addr.road || '',
            pincode: addr.postcode || '',
          };
        }
      }
    }
  } catch (err) {
    console.warn('OSM Nominatim Geocoding error, falling back:', err.message);
  }

  // Step 3: Offline Curated India Places Fallback
  const matched = KNOWN_LOCATIONS.find(loc =>
    loc.keywords.some(kw => lowerQuery.includes(kw))
  );

  if (matched) {
    return {
      latitude: matched.latitude,
      longitude: matched.longitude,
      fullAddress: `${query}, ${matched.city}, ${matched.state} ${matched.pincode}`,
      city: matched.city,
      state: matched.state,
      area: query.split(',')[0] || matched.city,
      pincode: matched.pincode,
    };
  }

  // Default Fallback (Guntur, AP)
  return {
    latitude: 16.3067,
    longitude: 80.4363,
    fullAddress: query,
    city: 'Guntur',
    state: 'Andhra Pradesh',
    area: query,
    pincode: '522002',
  };
}
