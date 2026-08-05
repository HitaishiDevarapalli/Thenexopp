import { prisma } from '../db.js';

/**
 * Format distance in meters to user-friendly string
 * @param {number} distanceMeters
 * @returns {string} e.g. "800 m away" or "2.3 km away"
 */
export function formatDistanceString(distanceMeters) {
  if (distanceMeters == null || isNaN(distanceMeters)) return '';
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m away`;
  }
  const km = (distanceMeters / 1000).toFixed(1);
  return `${km} km away`;
}

/**
 * Perform PostGIS Radius Property Search
 *
 * @param {Object} options
 * @param {number} options.latitude - Searched location latitude
 * @param {number} options.longitude - Searched location longitude
 * @param {number|null} [options.radiusMeters=50000] - Search radius in meters (50000 = 50km, 100000 = 100km, 200000 = 200km, null/0 = Anywhere)
 * @param {number} [options.page=1]
 * @param {number} [options.limit=20]
 * @param {string} [options.category]
 * @param {string} [options.status]
 * @returns {Promise<{ properties: Array, totalCount: number, page: number, limit: number, totalPages: number, searchedCoords: { lat: number, lng: number }, radiusMeters: number|null }>}
 */
export async function searchPropertiesPostGIS({
  latitude,
  longitude,
  radiusMeters = 50000,
  page = 1,
  limit = 20,
  category = null,
  status = null,
}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lng)) {
    throw new Error('Valid latitude and longitude coordinates are required for spatial search.');
  }

  const effectiveRadius = (radiusMeters && radiusMeters > 0) ? parseFloat(radiusMeters) : null;

  try {
    // Attempt PostGIS ST_DWithin & ST_Distance query via raw SQL
    let whereClause = `WHERE 1=1`;
    const params = [lng, lat];
    let paramIndex = 3;

    if (effectiveRadius !== null) {
      whereClause += ` AND ST_DWithin(
        COALESCE(p.location, ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography),
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $${paramIndex}
      )`;
      params.push(effectiveRadius);
      paramIndex++;
    }

    if (category) {
      whereClause += ` AND p.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // 1. Get total count
    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM "Property" p
      ${whereClause}
    `;

    const countResult = await prisma.$queryRawUnsafe(countSql, ...params);
    const totalCount = countResult[0]?.total || 0;

    // 2. Query paginated results sorted by nearest ST_Distance
    const selectSql = `
      SELECT p.*,
             ST_Distance(
               COALESCE(p.location, ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography),
               ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
             ) AS distance_meters
      FROM "Property" p
      ${whereClause}
      ORDER BY distance_meters ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const queryParams = [...params, limitNum, offset];
    const rawProperties = await prisma.$queryRawUnsafe(selectSql, ...queryParams);

    const properties = rawProperties.map(p => {
      const distMeters = p.distance_meters != null ? Number(p.distance_meters) : null;
      return {
        ...p,
        distanceMeters: distMeters,
        distanceText: formatDistanceString(distMeters),
      };
    });

    return {
      properties,
      totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
      searchedCoords: { lat, lng },
      radiusMeters: effectiveRadius,
    };
  } catch (err) {
    console.warn('PostGIS query execution warning, trying Haversine fallback:', err.message);

    // Fallback: Haversine distance in SQL if PostGIS extension is not installed
    const rEarth = 6371000; // Earth radius in meters

    let whereClause = `WHERE 1=1`;
    const params = [lng, lat];
    let paramIndex = 3;

    if (category) {
      whereClause += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    const haversineSql = `
      SELECT *,
             (${rEarth} * acos(
               pcos(radians($2)) * cos(radians(latitude)) *
               cos(radians(longitude) - radians($1)) +
               sin(radians($2)) * sin(radians(latitude))
             )) AS distance_meters
      FROM "Property"
      ${whereClause}
    `;

    // Fetch all for in-memory radius filter if needed
    const allProps = await prisma.$queryRawUnsafe(`
      SELECT *,
             (${rEarth} * acos(
               least(1.0, greatest(-1.0,
                 cos(radians($2::float)) * cos(radians(latitude)) *
                 cos(radians(longitude) - radians($1::float)) +
                 sin(radians($2::float)) * sin(radians(latitude))
               ))
             )) AS distance_meters
      FROM "Property"
    `, lng, lat);

    let filtered = allProps.map(p => ({
      ...p,
      distanceMeters: Number(p.distance_meters || 0),
      distanceText: formatDistanceString(Number(p.distance_meters || 0)),
    }));

    if (effectiveRadius !== null) {
      filtered = filtered.filter(p => p.distanceMeters <= effectiveRadius);
    }

    filtered.sort((a, b) => a.distanceMeters - b.distanceMeters);

    const totalCount = filtered.length;
    const paginatedProps = filtered.slice(offset, offset + limitNum);

    return {
      properties: paginatedProps,
      totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
      searchedCoords: { lat, lng },
      radiusMeters: effectiveRadius,
    };
  }
}
