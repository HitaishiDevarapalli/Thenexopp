import { prisma } from './db.js';
import { getMemoryLocations, calculateDistanceKm, updateMemoryLocations, INITIAL_LOCATIONS } from './locationDatabase.js';

// Ultra-fast in-memory cache for popular and trending locations
let popularCache = null;
let popularCacheTime = 0;

let trendingCache = null;
let trendingCacheTime = 0;

// Levenshtein distance for fuzzy typo correction (e.g., Hydrabad -> Hyderabad)
function editDistance(s1, s2) {
  const str1 = s1.toLowerCase();
  const str2 = s2.toLowerCase();
  const costs = [];
  for (let i = 0; i <= str1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= str2.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (str1.charAt(i - 1) !== str2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[str2.length] = lastValue;
  }
  return costs[str2.length];
}

/**
 * GET /api/location/search?q=&page=&limit=&lat=&lng=
 */
export async function searchLocations(req, res) {
  try {
    const rawQuery = (req.query.q || '').toString().trim();
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const userLat = req.query.lat ? parseFloat(req.query.lat) : null;
    const userLng = req.query.lng ? parseFloat(req.query.lng) : null;

    if (!rawQuery) {
      return res.json({
        success: true,
        data: [],
        page,
        limit,
        total: 0,
        hasMore: false,
      });
    }

    const q = rawQuery.toLowerCase();
    const allLocations = getMemoryLocations();

    // Calculate match score and distance for every location item
    const scoredList = [];

    for (const item of allLocations) {
      if (item.status === 'Inactive') continue;

      let score = 0;
      const itemName = item.name.toLowerCase();
      const itemCity = (item.city || '').toLowerCase();
      const itemState = (item.state || '').toLowerCase();
      const itemDistrict = (item.district || '').toLowerCase();
      const aliases = (item.aliases || []).map(a => a.toLowerCase());
      const keywords = (item.searchKeywords || []).map(k => k.toLowerCase());

      // 1. Exact Name match
      if (itemName === q) {
        score += 1000;
      }
      // 2. Starts with Name
      else if (itemName.startsWith(q)) {
        score += 600;
      }
      // 3. Alias Exact or Starts With (e.g. BZA -> Vijayawada, Vizag -> Visakhapatnam)
      else if (aliases.some(a => a === q)) {
        score += 550;
      } else if (aliases.some(a => a.startsWith(q))) {
        score += 450;
      }
      // 4. Contains Name or Alias
      else if (itemName.includes(q)) {
        score += 300;
      } else if (aliases.some(a => a.includes(q))) {
        score += 250;
      }
      // 5. City, State, District, Keywords match
      else if (itemCity.startsWith(q) || itemDistrict.startsWith(q) || itemState.startsWith(q)) {
        score += 200;
      } else if (keywords.some(k => k.includes(q))) {
        score += 180;
      }
      // 6. Typo Correction / Fuzzy Matching (Levenshtein distance <= 2 for words >= 4 chars)
      else if (q.length >= 4) {
        const dist = editDistance(itemName, q);
        if (dist <= 2) {
          score += 140 - dist * 30;
        } else {
          // Check aliases for fuzzy match
          for (const alias of aliases) {
            if (editDistance(alias, q) <= 2) {
              score += 120;
              break;
            }
          }
        }
      }

      if (score > 0) {
        // Boost score based on priority, listingCount, and popularity
        score += (item.priority || 0) * 2;
        score += Math.min(item.listingCount || 0, 500);

        let distanceKm = null;
        if (userLat !== null && userLng !== null && item.latitude && item.longitude) {
          distanceKm = calculateDistanceKm(userLat, userLng, item.latitude, item.longitude);
          if (distanceKm !== null && distanceKm <= 50) {
            // Distance boost for nearby locations
            score += Math.max(0, 100 - distanceKm * 2);
          }
        }

        scoredList.push({
          id: item.id || item.slug,
          name: item.name,
          slug: item.slug,
          type: item.type || 'City',
          city: item.city || item.name,
          district: item.district || '',
          state: item.state || '',
          country: item.country || 'India',
          latitude: item.latitude,
          longitude: item.longitude,
          listingCount: item.listingCount || 0,
          score,
          distanceKm,
          displayName: [item.name, item.city !== item.name ? item.city : '', item.state].filter(Boolean).join(', '),
        });
      }
    }

    // Sort by match score descending, then listingCount descending
    scoredList.sort((a, b) => b.score - a.score || b.listingCount - a.listingCount);

    // Paginate results (Infinite scroll support)
    const startIndex = (page - 1) * limit;
    const paginatedResults = scoredList.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < scoredList.length;

    return res.json({
      success: true,
      data: paginatedResults,
      page,
      limit,
      total: scoredList.length,
      hasMore,
    });
  } catch (error) {
    console.error('Error in searchLocations:', error);
    return res.status(500).json({ success: false, error: 'Failed to search locations.' });
  }
}

/**
 * GET /api/location/popular
 */
export async function getPopularCities(req, res) {
  try {
    const now = Date.now();
    if (popularCache && now - popularCacheTime < 300000) { // 5 min cache
      return res.json({ success: true, data: popularCache });
    }

    const popularNames = [
      'Hyderabad',
      'Bangalore',
      'Chennai',
      'Mumbai',
      'Delhi',
      'Pune',
      'Visakhapatnam',
      'Guntur',
      'Amaravati',
    ];

    const allLocations = getMemoryLocations();
    const result = [];

    for (const name of popularNames) {
      const match = allLocations.find(l => l.name.toLowerCase() === name.toLowerCase());
      if (match) {
        result.push({
          id: match.id || match.slug,
          name: match.name,
          slug: match.slug,
          type: match.type || 'City',
          city: match.city || match.name,
          state: match.state || '',
          listingCount: match.listingCount || 0,
          latitude: match.latitude,
          longitude: match.longitude,
        });
      }
    }

    popularCache = result;
    popularCacheTime = now;

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error in getPopularCities:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch popular cities.' });
  }
}

/**
 * GET /api/location/trending
 */
export async function getTrendingLocations(req, res) {
  try {
    const now = Date.now();
    if (trendingCache && now - trendingCacheTime < 300000) {
      return res.json({ success: true, data: trendingCache });
    }

    const allLocations = getMemoryLocations();
    const trending = allLocations
      .filter(l => l.trending && l.status !== 'Inactive')
      .slice(0, 10)
      .map(l => ({
        id: l.id || l.slug,
        name: l.name,
        slug: l.slug,
        type: l.type || 'Locality',
        city: l.city || '',
        state: l.state || '',
        listingCount: l.listingCount || 0,
        latitude: l.latitude,
        longitude: l.longitude,
      }));

    trendingCache = trending;
    trendingCacheTime = now;

    return res.json({ success: true, data: trending });
  } catch (error) {
    console.error('Error in getTrendingLocations:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch trending locations.' });
  }
}

/**
 * GET /api/location/nearby?lat=&lng=&radius=5
 */
export async function getNearbyLocations(req, res) {
  try {
    const userLat = parseFloat(req.query.lat);
    const userLng = parseFloat(req.query.lng);
    const radiusKm = parseFloat(req.query.radius || '5');

    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({ success: false, error: 'Valid lat and lng required.' });
    }

    const allLocations = getMemoryLocations();
    const nearby = [];

    for (const item of allLocations) {
      if (item.status === 'Inactive' || !item.latitude || !item.longitude) continue;
      const dist = calculateDistanceKm(userLat, userLng, item.latitude, item.longitude);
      if (dist !== null && dist <= radiusKm) {
        nearby.push({
          id: item.id || item.slug,
          name: item.name,
          slug: item.slug,
          type: item.type || 'Locality',
          city: item.city || item.name,
          state: item.state || '',
          distanceKm: dist,
          listingCount: item.listingCount || 0,
          latitude: item.latitude,
          longitude: item.longitude,
          displayName: [item.name, item.city, item.state].filter(Boolean).join(', '),
        });
      }
    }

    nearby.sort((a, b) => a.distanceKm - b.distanceKm);

    return res.json({ success: true, data: nearby });
  } catch (error) {
    console.error('Error in getNearbyLocations:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch nearby locations.' });
  }
}

/**
 * GET /api/location/recent & POST /api/location/recent
 */
export async function getRecentSearches(req, res) {
  try {
    const userId = req.user ? req.user.id : null;
    if (!userId) {
      return res.json({ success: true, data: [] });
    }

    const dbRecents = await prisma.recentSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }).catch(() => []);

    return res.json({ success: true, data: dbRecents });
  } catch (error) {
    return res.json({ success: true, data: [] });
  }
}

export async function saveRecentSearch(req, res) {
  try {
    const userId = req.user ? req.user.id : null;
    const { query, locationName, locationId } = req.body;

    if (!locationName) {
      return res.status(400).json({ success: false, error: 'locationName required.' });
    }

    if (userId) {
      await prisma.recentSearch.create({
        data: {
          userId,
          query: query || locationName,
          locationName,
          locationId: locationId || null,
        },
      }).catch(() => {});
    }

    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: true });
  }
}

/**
 * ADMIN LOCATION MANAGEMENT APIS
 */
export async function getAdminLocations(req, res) {
  try {
    const q = (req.query.q || '').toString().trim().toLowerCase();
    let locations = getMemoryLocations();

    if (q) {
      locations = locations.filter(l =>
        l.name.toLowerCase().includes(q) ||
        (l.city && l.city.toLowerCase().includes(q)) ||
        (l.state && l.state.toLowerCase().includes(q)) ||
        (l.type && l.type.toLowerCase().includes(q))
      );
    }

    return res.json({ success: true, data: locations, total: locations.length });
  } catch (error) {
    console.error('Error in getAdminLocations:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch admin locations.' });
  }
}

export async function createAdminLocation(req, res) {
  try {
    const {
      name,
      slug,
      type,
      latitude,
      longitude,
      parentName,
      city,
      district,
      state,
      country,
      aliases,
      searchKeywords,
      population,
      priority,
      status,
      featured,
      trending,
      listingCount,
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Location name is required.' });
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newLoc = {
      id: 'loc-' + Date.now(),
      name,
      slug: generatedSlug,
      type: type || 'City',
      latitude: parseFloat(latitude || 0),
      longitude: parseFloat(longitude || 0),
      parentName: parentName || '',
      city: city || name,
      district: district || '',
      state: state || 'Andhra Pradesh',
      country: country || 'India',
      aliases: Array.isArray(aliases) ? aliases : (aliases ? aliases.split(',').map(a => a.trim()) : []),
      searchKeywords: Array.isArray(searchKeywords) ? searchKeywords : (searchKeywords ? searchKeywords.split(',').map(k => k.trim()) : [name.toLowerCase()]),
      population: parseInt(population || 0, 10),
      priority: parseInt(priority || 50, 10),
      status: status || 'Active',
      featured: Boolean(featured),
      trending: Boolean(trending),
      listingCount: parseInt(listingCount || 0, 10),
      createdAt: new Date().toISOString(),
    };

    // Try saving to Prisma DB
    await prisma.locationItem.create({ data: newLoc }).catch(() => {});

    // Update memory cache
    const current = getMemoryLocations();
    updateMemoryLocations([newLoc, ...current]);

    // Invalidate cache
    popularCache = null;
    trendingCache = null;

    return res.status(201).json({ success: true, data: newLoc });
  } catch (error) {
    console.error('Error in createAdminLocation:', error);
    return res.status(500).json({ success: false, error: 'Failed to create location.' });
  }
}

export async function updateAdminLocation(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const current = getMemoryLocations();
    const index = current.findIndex(l => (l.id === id || l.slug === id));

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Location not found.' });
    }

    const updatedItem = { ...current[index], ...updates, updatedAt: new Date().toISOString() };

    await prisma.locationItem.update({
      where: { slug: updatedItem.slug },
      data: updates,
    }).catch(() => {});

    current[index] = updatedItem;
    updateMemoryLocations([...current]);

    popularCache = null;
    trendingCache = null;

    return res.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error('Error in updateAdminLocation:', error);
    return res.status(500).json({ success: false, error: 'Failed to update location.' });
  }
}

export async function deleteAdminLocation(req, res) {
  try {
    const { id } = req.params;

    const current = getMemoryLocations();
    const item = current.find(l => l.id === id || l.slug === id);

    if (item) {
      await prisma.locationItem.delete({ where: { slug: item.slug } }).catch(() => {});
    }

    const filtered = current.filter(l => l.id !== id && l.slug !== id);
    updateMemoryLocations(filtered);

    popularCache = null;
    trendingCache = null;

    return res.json({ success: true, message: 'Location deleted successfully.' });
  } catch (error) {
    console.error('Error in deleteAdminLocation:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete location.' });
  }
}

export async function importBulkLocationsCsv(req, res) {
  try {
    const { items } = req.body; // Expect array of location objects parsed from CSV
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid or empty CSV items array.' });
    }

    const created = [];
    const current = getMemoryLocations();

    for (const raw of items) {
      if (!raw.name) continue;
      const slug = raw.slug || raw.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const loc = {
        id: 'loc-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        name: raw.name,
        slug,
        type: raw.type || 'Locality',
        latitude: parseFloat(raw.latitude || 0),
        longitude: parseFloat(raw.longitude || 0),
        city: raw.city || raw.name,
        district: raw.district || '',
        state: raw.state || 'Andhra Pradesh',
        country: raw.country || 'India',
        aliases: raw.aliases ? raw.aliases.split(',').map(s => s.trim()) : [],
        searchKeywords: raw.searchKeywords ? raw.searchKeywords.split(',').map(s => s.trim()) : [raw.name.toLowerCase()],
        population: parseInt(raw.population || 0, 10),
        listingCount: parseInt(raw.listingCount || 0, 10),
        priority: parseInt(raw.priority || 50, 10),
        status: raw.status || 'Active',
        featured: raw.featured === 'true' || raw.featured === true,
        trending: raw.trending === 'true' || raw.trending === true,
      };

      created.push(loc);
      await prisma.locationItem.upsert({
        where: { slug: loc.slug },
        update: loc,
        create: loc,
      }).catch(() => {});
    }

    updateMemoryLocations([...created, ...current]);
    popularCache = null;
    trendingCache = null;

    return res.json({ success: true, importedCount: created.length });
  } catch (error) {
    console.error('Error in importBulkLocationsCsv:', error);
    return res.status(500).json({ success: false, error: 'Failed to import CSV locations.' });
  }
}
