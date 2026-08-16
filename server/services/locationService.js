import pino from 'pino';

const logger = pino({ name: 'LocationService' });

// In-memory LRU Cache with TTL for search queries and reverse geocoding
const SEARCH_CACHE = new Map();
const REVERSE_CACHE = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const getCached = (cache, key) => {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.data;
};

const setCached = (cache, key, data) => {
  if (cache.size > 2000) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS });
};

// Popular Indian Cities predefined data for initial seeding and fast fallback
const DEFAULT_POPULAR_CITIES = [
  { city: 'Hyderabad', state: 'Telangana', area: 'Hitech City / Madhapur', lat: 17.3850, lng: 78.4867, popularity: 100 },
  { city: 'Bangalore', state: 'Karnataka', area: 'Koramangala / Indiranagar', lat: 12.9716, lng: 77.5946, popularity: 95 },
  { city: 'Chennai', state: 'Tamil Nadu', area: 'T. Nagar / Velachery', lat: 13.0827, lng: 80.2707, popularity: 90 },
  { city: 'Mumbai', state: 'Maharashtra', area: 'Bandra / Andheri', lat: 19.0760, lng: 72.8777, popularity: 88 },
  { city: 'Delhi', state: 'Delhi', area: 'Connaught Place / Dwarka', lat: 28.7041, lng: 77.1025, popularity: 85 },
  { city: 'Pune', state: 'Maharashtra', area: 'Koregaon Park / Wakad', lat: 18.5204, lng: 73.8567, popularity: 82 },
  { city: 'Vijayawada', state: 'Andhra Pradesh', area: 'Benz Circle', lat: 16.5062, lng: 80.6480, popularity: 80 },
  { city: 'Guntur', state: 'Andhra Pradesh', area: 'Brodipet / SVN Colony', lat: 16.3067, lng: 80.4365, popularity: 92 },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', area: 'MVP Colony / Siripuram', lat: 17.6868, lng: 83.2185, popularity: 78 },
];

// Curated seed locations
const SEED_LOCATIONS = [
  { osmId: '3948120', osmType: 'node', country: 'India', state: 'Andhra Pradesh', district: 'Guntur', city: 'Guntur', suburb: 'SVN Colony', area: 'SVN Colony', locality: 'SVN Colony', postcode: '522006', lat: 16.3100, lng: 80.4300, displayName: 'SVN Colony, Guntur, Andhra Pradesh', popularity: 99 },
  { osmId: '3948121', osmType: 'node', country: 'India', state: 'Andhra Pradesh', district: 'Guntur', city: 'Guntur', suburb: 'Pattabhipuram', area: 'Pattabhipuram', locality: 'Pattabhipuram Main Road', postcode: '522006', lat: 16.3080, lng: 80.4280, displayName: 'Pattabhipuram, Guntur, Andhra Pradesh', popularity: 94 },
  { osmId: '3948122', osmType: 'node', country: 'India', state: 'Andhra Pradesh', district: 'Guntur', city: 'Guntur', suburb: 'Brodipet', area: 'Brodipet', locality: 'Brodipet (Brodipeta)', postcode: '522002', lat: 16.3067, lng: 80.4365, displayName: 'Brodipet (Brodipeta), Guntur, Andhra Pradesh', popularity: 98 },
  { osmId: '3948123', osmType: 'node', country: 'India', state: 'Andhra Pradesh', district: 'Guntur', city: 'Guntur', suburb: 'Arundelpet', area: 'Arundelpet', locality: 'Arundelpet (Arundelpeta)', postcode: '522002', lat: 16.3050, lng: 80.4380, displayName: 'Arundelpet (Arundelpeta), Guntur, Andhra Pradesh', popularity: 88 },
  { osmId: '3948124', osmType: 'node', country: 'India', state: 'Andhra Pradesh', district: 'Guntur', city: 'Guntur', suburb: 'Guntur Railway Station', area: 'Guntur Railway Station', locality: 'Station Road', postcode: '522001', lat: 16.3000, lng: 80.4450, displayName: 'Guntur Railway Station, Guntur, Andhra Pradesh', popularity: 89 },
  { osmId: '3948136', osmType: 'node', country: 'India', state: 'Andhra Pradesh', district: 'Guntur', city: 'Guntur', suburb: 'Kobaldupeta', area: 'Kobaldupeta', locality: 'Kobaldupeta Main', postcode: '522004', lat: 16.3020, lng: 80.4320, displayName: 'Kobaldupeta, Guntur, Andhra Pradesh', popularity: 96 },
  { osmId: '3948137', osmType: 'node', country: 'India', state: 'Andhra Pradesh', district: 'Guntur', city: 'Guntur', suburb: 'Gorantla', area: 'Gorantla', locality: 'Gorantla', postcode: '522034', lat: 16.3200, lng: 80.4150, displayName: 'Gorantla, Guntur, Andhra Pradesh', popularity: 90 },
  { osmId: '3948138', osmType: 'node', country: 'India', state: 'Andhra Pradesh', district: 'Guntur', city: 'Guntur', suburb: 'Vidyanagar', area: 'Vidyanagar', locality: 'Vidyanagar', postcode: '522007', lat: 16.2980, lng: 80.4350, displayName: 'Vidyanagar, Guntur, Andhra Pradesh', popularity: 89 },
  { osmId: '3948139', osmType: 'node', country: 'India', state: 'Andhra Pradesh', district: 'Guntur', city: 'Guntur', suburb: 'Nalanda Nagar', area: 'Nalanda Nagar', locality: 'Nalanda Nagar', postcode: '522006', lat: 16.3120, lng: 80.4250, displayName: 'Nalanda Nagar, Guntur, Andhra Pradesh', popularity: 93 },
  { osmId: '3948125', osmType: 'node', country: 'India', state: 'Telangana', district: 'Hyderabad', city: 'Hyderabad', suburb: 'Madhapur', area: 'Madhapur', locality: 'Madhapur', postcode: '500081', lat: 17.4483, lng: 78.3915, displayName: 'Madhapur, Hyderabad, Telangana', popularity: 98 },
  { osmId: '3948126', osmType: 'node', country: 'India', state: 'Telangana', district: 'Hyderabad', city: 'Hyderabad', suburb: 'Hitech City', area: 'Hitech City', locality: 'Hitech City', postcode: '500081', lat: 17.4435, lng: 78.3772, displayName: 'Hitech City, Hyderabad, Telangana', popularity: 97 },
  { osmId: '3948127', osmType: 'node', country: 'India', state: 'Telangana', district: 'Hyderabad', city: 'Hyderabad', suburb: 'Kondapur', area: 'Kondapur', locality: 'Kondapur', postcode: '500084', lat: 17.4622, lng: 78.3568, displayName: 'Kondapur, Hyderabad, Telangana', popularity: 94 },
  { osmId: '3948128', osmType: 'node', country: 'India', state: 'Telangana', district: 'Ranga Reddy', city: 'Hyderabad', suburb: 'Gachibowli', area: 'Gachibowli', locality: 'Gachibowli', postcode: '500032', lat: 17.4401, lng: 78.3489, displayName: 'Gachibowli, Hyderabad, Telangana', popularity: 96 },
  { osmId: '3948129', osmType: 'node', country: 'India', state: 'Telangana', district: 'Hyderabad', city: 'Hyderabad', suburb: 'Hyderguda', area: 'Hyderguda', locality: 'Hyderguda', postcode: '500029', lat: 17.3970, lng: 78.4795, displayName: 'Hyderguda, Hyderabad, Telangana', popularity: 82 },
  { osmId: '3948130', osmType: 'node', country: 'India', state: 'Telangana', district: 'Sangareddy', city: 'Hyderabad', suburb: 'Kondakal', area: 'Kondakal', locality: 'Kondakal Village', postcode: '501505', lat: 17.4800, lng: 78.2000, displayName: 'Kondakal, Hyderabad, Telangana', popularity: 75 },
  { osmId: '3948131', osmType: 'node', country: 'India', state: 'Andhra Pradesh', district: 'NTR District', city: 'Vijayawada', suburb: 'Benz Circle', area: 'Benz Circle', locality: 'Benz Circle', postcode: '520010', lat: 16.5020, lng: 80.6480, displayName: 'Benz Circle, Vijayawada, Andhra Pradesh', popularity: 91 },
  { osmId: '3948132', osmType: 'node', country: 'India', state: 'Karnataka', district: 'Bengaluru Urban', city: 'Bangalore', suburb: 'Whitefield', area: 'Whitefield', locality: 'Whitefield', postcode: '560066', lat: 12.9698, lng: 77.7499, displayName: 'Whitefield, Bangalore, Karnataka', popularity: 95 },
  { osmId: '3948133', osmType: 'node', country: 'India', state: 'Karnataka', district: 'Bengaluru Urban', city: 'Bangalore', suburb: 'Benson Town', area: 'Benson Town', locality: 'Benson Town', postcode: '560046', lat: 13.0010, lng: 77.6020, displayName: 'Benson Town, Bangalore, Karnataka', popularity: 80 },
  { osmId: '3948134', osmType: 'node', country: 'India', state: 'Telangana', district: 'Cyberabad', city: 'Hyderabad', suburb: 'Madinaguda', area: 'Madinaguda', locality: 'Madinaguda', postcode: '500050', lat: 17.4950, lng: 78.3450, displayName: 'Madinaguda, Hyderabad, Telangana', popularity: 84 },
  { osmId: '3948135', osmType: 'node', country: 'India', state: 'Andhra Pradesh', district: 'Visakhapatnam', city: 'Visakhapatnam', suburb: 'Maddilapalem', area: 'Maddilapalem', locality: 'Maddilapalem', postcode: '530013', lat: 17.7300, lng: 83.3200, displayName: 'Maddilapalem, Visakhapatnam, Andhra Pradesh', popularity: 83 },
];

/**
 * Initialize DB with seed locations using pure Prisma ORM
 */
export const initLocationDb = async (prisma) => {
  try {
    const count = await prisma.location.count().catch(() => 0);
    if (count < 15) {
      logger.info('Seeding initial location database...');

      for (const loc of [...DEFAULT_POPULAR_CITIES, ...SEED_LOCATIONS]) {
        const displayName = loc.displayName || `${loc.area ? loc.area + ', ' : ''}${loc.city}, ${loc.state}`;
        const searchText = `${loc.city} ${loc.area || ''} ${loc.locality || ''} ${loc.suburb || ''} ${loc.district || ''} ${loc.state} ${displayName}`.toLowerCase();
        
        await prisma.location.create({
          data: {
            osmId: loc.osmId || null,
            osmType: loc.osmType || null,
            country: loc.country || 'India',
            state: loc.state,
            district: loc.district || loc.city,
            city: loc.city,
            suburb: loc.suburb || loc.area || loc.city,
            area: loc.area || loc.city,
            locality: loc.locality || loc.area || loc.city,
            postcode: loc.postcode || '500001',
            postalCode: loc.postcode || '500001',
            latitude: loc.lat,
            longitude: loc.lng,
            displayName,
            searchText,
            popularity: loc.popularity || 50,
          },
        }).catch(() => {});
      }
      logger.info('Location database initial seeding complete.');
    }
  } catch (err) {
    logger.warn({ error: err.message }, 'Failed during Location DB initialization');
  }
};

/**
 * Haversine distance in KM
 */
export const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Enterprise OLX-Style Normalized Location Search Engine
 * Ranks: Exact Match > Prefix Match > Pincode Match > Locality Match > City Match > Proximity
 */
export const searchLocationsService = async (prisma, query, limit = 10, userLat = null, userLng = null) => {
  if (!query || typeof query !== 'string' || query.trim().length < 1) {
    return [];
  }

  const cleanQuery = query.trim().toLowerCase();
  const cacheKey = `search:${cleanQuery}:${limit}`;
  const cached = getCached(SEARCH_CACHE, cacheKey);
  if (cached) return cached;

  let results = [];

  // 1. Search PostgreSQL Database
  try {
    const dbMatches = await prisma.location.findMany({
      where: {
        OR: [
          { city: { contains: cleanQuery, mode: 'insensitive' } },
          { area: { contains: cleanQuery, mode: 'insensitive' } },
          { locality: { contains: cleanQuery, mode: 'insensitive' } },
          { suburb: { contains: cleanQuery, mode: 'insensitive' } },
          { district: { contains: cleanQuery, mode: 'insensitive' } },
          { postcode: { startsWith: cleanQuery } },
          { postalCode: { startsWith: cleanQuery } },
          { displayName: { contains: cleanQuery, mode: 'insensitive' } },
          { searchText: { contains: cleanQuery, mode: 'insensitive' } },
        ],
      },
      orderBy: [{ popularity: 'desc' }],
      take: Number(limit) * 2 || 20,
    }).catch(() => []);

    if (Array.isArray(dbMatches)) {
      results.push(...dbMatches);
    }
  } catch (err) {
    logger.warn({ error: err.message }, 'PostgreSQL search notice');
  }

  // 2. Photon / OpenStreetMap Backend Geocoder fallback if few results
  if (results.length < 5) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery + ' India')}&limit=10&lang=en`;
      const response = await fetch(photonUrl, {
        signal: controller.signal,
        headers: { 'User-Agent': 'TheNexopp-LocationService/1.0' },
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (response && response.ok) {
        const photonData = await response.json().catch(() => null);
        if (photonData && Array.isArray(photonData.features)) {
          for (const feature of photonData.features) {
            const props = feature.properties || {};
            const coords = feature.geometry?.coordinates || [];
            const lng = coords[0];
            const lat = coords[1];
            if (lat && lng) {
              const area = props.name || props.street || props.district || props.city || cleanQuery;
              const city = props.city || props.county || props.district || 'City';
              const district = props.district || city;
              const state = props.state || 'State';
              const country = props.country || 'India';
              const postcode = props.postcode || '';
              const displayName = [area, city, state !== city ? state : '', country].filter(Boolean).join(', ');

              const isDuplicate = results.some(
                r => Math.abs((r.latitude || 0) - lat) < 0.001 && Math.abs((r.longitude || 0) - lng) < 0.001
              );

              if (!isDuplicate) {
                results.push({
                  id: `osm-${props.osm_id || Math.random()}`,
                  osmId: props.osm_id ? String(props.osm_id) : null,
                  osmType: props.osm_type || 'place',
                  country,
                  state,
                  district,
                  city,
                  suburb: area,
                  area,
                  locality: area,
                  postcode,
                  postalCode: postcode,
                  latitude: lat,
                  longitude: lng,
                  displayName,
                  searchText: `${city} ${area} ${state} ${postcode} ${displayName}`.toLowerCase(),
                  popularity: 1,
                });
              }
            }
          }
        }
      }
    } catch {}
  }

  // 3. Priority Ranking Engine
  results.sort((a, b) => {
    const aName = (a.area || a.city || a.displayName || '').toLowerCase();
    const bName = (b.area || b.city || b.displayName || '').toLowerCase();

    // Exact Match
    const aExact = aName === cleanQuery;
    const bExact = bName === cleanQuery;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;

    // StartsWith Match
    const aStarts = aName.startsWith(cleanQuery);
    const bStarts = bName.startsWith(cleanQuery);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;

    // Proximity to user if user coordinates provided
    if (userLat && userLng) {
      const aDist = haversineKm(userLat, userLng, a.latitude, a.longitude);
      const bDist = haversineKm(userLat, userLng, b.latitude, b.longitude);
      return aDist - bDist;
    }

    // Popularity score
    return (b.popularity || 0) - (a.popularity || 0);
  });

  // 4. Normalize results for frontend
  const normalized = results.slice(0, Number(limit) || 10).map((loc) => ({
    id: loc.id || `loc-${Math.random()}`,
    name: loc.area || loc.locality || loc.city || loc.displayName,
    type: loc.suburb ? 'locality' : 'city',
    locality: loc.locality || loc.area || null,
    city: loc.city,
    district: loc.district || loc.city,
    state: loc.state,
    country: loc.country || 'India',
    countryCode: 'IN',
    postcode: loc.postcode || loc.postalCode || null,
    postalCode: loc.postcode || loc.postalCode || null,
    latitude: loc.latitude,
    longitude: loc.longitude,
    lat: loc.latitude,
    lng: loc.longitude,
    displayName: loc.displayName || `${loc.area ? loc.area + ', ' : ''}${loc.city}, ${loc.state}`,
  }));

  setCached(SEARCH_CACHE, cacheKey, normalized);
  return normalized;
};

/**
 * Enterprise Multi-Tier Reverse Geocoding Engine
 * Tiers: BigDataCloud client API -> Nominatim -> Seed DB fallback
 */
export const reverseGeocodeService = async (prisma, lat, lng) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Invalid latitude or longitude provided');
  }

  const cacheKey = `rev:${latitude.toFixed(4)}:${longitude.toFixed(4)}`;
  const cached = getCached(REVERSE_CACHE, cacheKey);
  if (cached) return cached;

  let resolved = null;

  // Tier 1: BigDataCloud High-Accuracy Client Reverse Geocoder
  try {
    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (bdcRes.ok) {
      const data = await bdcRes.json();
      if (data && (data.city || data.locality || data.principalSubdivision)) {
        const city = data.city || data.locality || data.localityInfo?.administrative?.[2]?.name || 'City';
        const locality = data.locality || data.localityInfo?.administrative?.[3]?.name || city;
        const area = locality;
        const district = data.localityInfo?.administrative?.[2]?.name || city;
        const state = data.principalSubdivision || 'Andhra Pradesh';
        const country = data.countryName || 'India';
        const postcode = data.postcode || '';
        const displayName = [locality, city, district !== city ? district : '', state, postcode, country].filter(Boolean).join(', ');

        resolved = {
          latitude,
          longitude,
          lat: latitude,
          lng: longitude,
          displayName,
          locality,
          area,
          suburb: locality,
          city,
          district,
          state,
          country,
          countryCode: 'IN',
          postcode,
          postalCode: postcode,
          accuracy: 15,
        };
      }
    }
  } catch (err) {
    logger.warn({ error: err.message }, 'BigDataCloud reverse geocode attempt notice');
  }

  // Tier 2: OpenStreetMap Nominatim jsonv2 fallback
  if (!resolved) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'TheNexopp-LocationService/1.0 (contact@thenexopp.com)',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const addr = data.address || {};
        const state = addr.state || addr.region || 'Andhra Pradesh';
        const district = addr.state_district || addr.county || addr.district || addr.city || '';
        const city = addr.city || addr.town || addr.municipality || addr.county || addr.village || 'City';
        const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.quarter || addr.subdivision || addr.village || '';
        const locality = suburb || addr.road || addr.commercial || '';
        const area = locality || city;
        const postcode = addr.postcode || '';
        const displayName = data.display_name || [area, city, state].filter(Boolean).join(', ');

        resolved = {
          latitude,
          longitude,
          lat: latitude,
          lng: longitude,
          displayName,
          locality: locality || area,
          area,
          suburb,
          city,
          district: district || city,
          state,
          country: addr.country || 'India',
          countryCode: 'IN',
          postcode,
          postalCode: postcode,
          accuracy: 25,
        };
      }
    } catch (err) {
      logger.warn({ error: err.message }, 'Nominatim reverse geocode attempt notice');
    }
  }

  // Tier 3: Default clean coordinates representation
  if (!resolved) {
    resolved = {
      latitude,
      longitude,
      lat: latitude,
      lng: longitude,
      displayName: `Pinned Location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`,
      locality: 'Current Location',
      area: 'Current Location',
      city: 'City',
      district: '',
      state: '',
      country: 'India',
      countryCode: 'IN',
      postcode: '',
      postalCode: '',
      accuracy: 50,
    };
  }

  // Persist / update popularity in DB asynchronously
  if (resolved && prisma) {
    (async () => {
      try {
        const existing = await prisma.location.findFirst({
          where: {
            OR: [
              { displayName: { equals: resolved.displayName, mode: 'insensitive' } },
              {
                AND: [
                  { city: { equals: resolved.city, mode: 'insensitive' } },
                  { area: { equals: resolved.area, mode: 'insensitive' } },
                ],
              },
            ],
          },
        }).catch(() => null);

        if (existing) {
          await prisma.location.update({
            where: { id: existing.id },
            data: { popularity: { increment: 1 } },
          }).catch(() => {});
        } else if (resolved.city && resolved.area) {
          await prisma.location.create({
            data: {
              country: resolved.country,
              state: resolved.state,
              district: resolved.district,
              city: resolved.city,
              suburb: resolved.suburb || resolved.area,
              area: resolved.area,
              locality: resolved.locality,
              postcode: resolved.postcode,
              postalCode: resolved.postcode,
              latitude,
              longitude,
              displayName: resolved.displayName,
              searchText: `${resolved.city} ${resolved.area} ${resolved.state} ${resolved.displayName}`.toLowerCase(),
              popularity: 1,
            },
          }).catch(() => {});
        }
      } catch {}
    })();
  }

  setCached(REVERSE_CACHE, cacheKey, resolved);
  return resolved;
};

/**
 * Fetch Popular Cities from Database
 */
export const getPopularCitiesService = async (prisma) => {
  try {
    const popularInDb = await prisma.location.findMany({
      select: {
        id: true,
        city: true,
        state: true,
        area: true,
        latitude: true,
        longitude: true,
        popularity: true,
        displayName: true,
      },
      orderBy: { popularity: 'desc' },
      take: 15,
    }).catch(() => []);

    const cityMap = new Map();
    for (const item of popularInDb) {
      if (!cityMap.has(item.city)) {
        cityMap.set(item.city, item);
      }
    }

    const result = Array.from(cityMap.values());

    for (const def of DEFAULT_POPULAR_CITIES) {
      if (!cityMap.has(def.city)) {
        result.push({
          id: `pop-${def.city.toLowerCase()}`,
          city: def.city,
          state: def.state,
          area: def.area,
          latitude: def.lat,
          longitude: def.lng,
          popularity: def.popularity,
          displayName: `${def.city}, ${def.state}`,
        });
      }
    }

    return result.slice(0, 10);
  } catch (err) {
    logger.error({ error: err.message }, 'Failed to fetch popular cities');
    return DEFAULT_POPULAR_CITIES.map((c, i) => ({
      id: `pop-default-${i}`,
      city: c.city,
      state: c.state,
      area: c.area,
      latitude: c.lat,
      longitude: c.lng,
      popularity: c.popularity,
      displayName: `${c.city}, ${c.state}`,
    }));
  }
};

/**
 * Nearby Property Search using Haversine distance
 */
export const searchNearbyPropertiesService = async (prisma, lat, lng, radiusMeters = 10000) => {
  const centerLat = parseFloat(lat);
  const centerLng = parseFloat(lng);
  const radiusKm = parseFloat(radiusMeters) > 500 ? parseFloat(radiusMeters) / 1000 : parseFloat(radiusMeters);

  if (isNaN(centerLat) || isNaN(centerLng)) {
    throw new Error('Valid latitude and longitude are required for nearby property search');
  }

  const properties = await prisma.property.findMany({
    orderBy: { createdAt: 'desc' },
  }).catch(() => []);

  const resultsWithDistance = [];

  for (const property of properties) {
    const pLat = parseFloat(property.latitude);
    const pLng = parseFloat(property.longitude);

    if (!isNaN(pLat) && !isNaN(pLng)) {
      const dist = haversineKm(centerLat, centerLng, pLat, pLng);
      if (dist <= radiusKm) {
        resultsWithDistance.push({
          ...property,
          distanceKm: parseFloat(dist.toFixed(2)),
          distanceText: dist < 1 ? `${Math.round(dist * 1000)} m away` : `${dist.toFixed(1)} km away`,
        });
      }
    }
  }

  resultsWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);
  return resultsWithDistance;
};

/**
 * Bounding Box (Map Area) Property Search
 */
export const searchMapBoundsPropertiesService = async (prisma, bounds) => {
  const { north, south, east, west } = bounds;
  const n = parseFloat(north);
  const s = parseFloat(south);
  const e = parseFloat(east);
  const w = parseFloat(west);

  if (isNaN(n) || isNaN(s) || isNaN(e) || isNaN(w)) {
    throw new Error('Valid bounding box coordinates (north, south, east, west) are required');
  }

  const properties = await prisma.property.findMany({
    orderBy: { createdAt: 'desc' },
  }).catch(() => []);

  return properties.filter((property) => {
    const pLat = parseFloat(property.latitude);
    const pLng = parseFloat(property.longitude);
    if (isNaN(pLat) || isNaN(pLng)) return false;
    return pLat >= s && pLat <= n && pLng >= w && pLng <= e;
  });
};

/**
 * Search Properties by location query and optional filters
 */
export const searchPropertiesByLocationService = async (prisma, queryParams = {}) => {
  const { location, city, area, type, minPrice, maxPrice, bedrooms } = queryParams;
  const where = {};

  if (city) {
    where.city = { contains: city, mode: 'insensitive' };
  } else if (location) {
    where.OR = [
      { city: { contains: location, mode: 'insensitive' } },
      { area: { contains: location, mode: 'insensitive' } },
      { address: { contains: location, mode: 'insensitive' } },
      { title: { contains: location, mode: 'insensitive' } },
    ];
  }

  if (area) {
    where.area = { contains: area, mode: 'insensitive' };
  }

  if (type && type !== 'All' && type !== 'Any') {
    where.type = { contains: type, mode: 'insensitive' };
  }

  if (bedrooms && bedrooms !== 'All' && bedrooms !== 'Any') {
    const b = parseInt(bedrooms, 10);
    if (!isNaN(b)) where.bedrooms = b;
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  const properties = await prisma.property.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  }).catch(() => []);

  return properties;
};
