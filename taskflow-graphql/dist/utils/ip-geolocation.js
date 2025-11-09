/**
 * IP Geolocation Utility
 * Fetches geographic information from IP addresses
 * Week 8: IP Geolocation implementation
 */
// ============================================================================
// Configuration
// ============================================================================
const GEOLOCATION_API_KEY = process.env.IP_GEOLOCATION_API_KEY;
const GEOLOCATION_ENABLED = Boolean(GEOLOCATION_API_KEY);
// Free tier API: ipapi.co (1,000 requests/day, no API key required)
// Premium option: ipgeolocation.io (requires API key)
const FREE_API_URL = 'https://ipapi.co';
const PREMIUM_API_URL = 'https://api.ipgeolocation.io/ipgeo';
// Cache for geolocation data (in-memory, simple implementation)
const geolocationCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const cacheTimestamps = new Map();
// ============================================================================
// Main Functions
// ============================================================================
/**
 * Get geolocation data for an IP address
 */
export async function getGeolocation(ip, options = {}) {
    const { timeout = 5000, retries = 2 } = options;
    // Validate IP address
    if (!isValidIP(ip)) {
        console.warn(`Invalid IP address: ${ip}`);
        return null;
    }
    // Check cache first
    const cached = getFromCache(ip);
    if (cached) {
        return cached;
    }
    // Try fetching from API with retries
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const data = GEOLOCATION_ENABLED
                ? await fetchFromPremiumAPI(ip, timeout)
                : await fetchFromFreeAPI(ip, timeout);
            if (data) {
                setCache(ip, data);
                return data;
            }
        }
        catch (error) {
            console.error(`Geolocation fetch failed (attempt ${attempt + 1}/${retries + 1}):`, error);
            if (attempt === retries) {
                // Return basic fallback data on final failure
                return getFallbackData(ip);
            }
        }
    }
    return getFallbackData(ip);
}
/**
 * Batch get geolocation for multiple IPs
 */
export async function getBatchGeolocation(ips) {
    const results = new Map();
    // Process in parallel with concurrency limit
    const BATCH_SIZE = 5;
    for (let i = 0; i < ips.length; i += BATCH_SIZE) {
        const batch = ips.slice(i, i + BATCH_SIZE);
        const promises = batch.map(ip => getGeolocation(ip));
        const batchResults = await Promise.all(promises);
        batch.forEach((ip, index) => {
            results.set(ip, batchResults[index]);
        });
    }
    return results;
}
/**
 * Clear geolocation cache
 */
export function clearGeolocationCache() {
    geolocationCache.clear();
    cacheTimestamps.clear();
}
/**
 * Get cache statistics
 */
export function getCacheStats() {
    const timestamps = Array.from(cacheTimestamps.values());
    return {
        size: geolocationCache.size,
        oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : null,
        newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : null,
    };
}
// ============================================================================
// Helper Functions
// ============================================================================
/**
 * Fetch from free API (ipapi.co)
 */
async function fetchFromFreeAPI(ip, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(`${FREE_API_URL}/${ip}/json/`, {
            signal: controller.signal,
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = (await response.json());
        // Map API response to our format
        return {
            ip: data.ip,
            city: data.city,
            region: data.region,
            country: data.country_name,
            countryCode: data.country_code,
            timezone: data.timezone,
            latitude: data.latitude,
            longitude: data.longitude,
            org: data.org,
            asn: data.asn,
        };
    }
    finally {
        clearTimeout(timeoutId);
    }
}
/**
 * Fetch from premium API (ipgeolocation.io)
 */
async function fetchFromPremiumAPI(ip, timeout) {
    if (!GEOLOCATION_API_KEY) {
        throw new Error('IP_GEOLOCATION_API_KEY is not set');
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(`${PREMIUM_API_URL}?apiKey=${GEOLOCATION_API_KEY}&ip=${ip}`, {
            signal: controller.signal,
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = (await response.json());
        // Map API response to our format
        return {
            ip: data.ip,
            city: data.city,
            region: data.state_prov,
            country: data.country_name,
            countryCode: data.country_code2,
            timezone: data.time_zone?.name,
            latitude: data.latitude ? parseFloat(data.latitude) : undefined,
            longitude: data.longitude ? parseFloat(data.longitude) : undefined,
            org: data.organization,
            asn: data.isp,
        };
    }
    finally {
        clearTimeout(timeoutId);
    }
}
/**
 * Validate IP address (IPv4 or IPv6)
 */
function isValidIP(ip) {
    // IPv4 regex
    const ipv4Regex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
    // IPv6 regex (simplified)
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}
/**
 * Get from cache if not expired
 */
function getFromCache(ip) {
    const cached = geolocationCache.get(ip);
    const timestamp = cacheTimestamps.get(ip);
    if (!cached || !timestamp) {
        return null;
    }
    // Check if cache entry is expired
    if (Date.now() - timestamp > CACHE_TTL) {
        geolocationCache.delete(ip);
        cacheTimestamps.delete(ip);
        return null;
    }
    return cached;
}
/**
 * Set cache entry
 */
function setCache(ip, data) {
    geolocationCache.set(ip, data);
    cacheTimestamps.set(ip, Date.now());
    // Cleanup old entries if cache gets too large
    if (geolocationCache.size > 1000) {
        cleanupCache();
    }
}
/**
 * Cleanup expired cache entries
 */
function cleanupCache() {
    const now = Date.now();
    const entriesToDelete = [];
    cacheTimestamps.forEach((timestamp, ip) => {
        if (now - timestamp > CACHE_TTL) {
            entriesToDelete.push(ip);
        }
    });
    entriesToDelete.forEach(ip => {
        geolocationCache.delete(ip);
        cacheTimestamps.delete(ip);
    });
}
/**
 * Get fallback data when API is unavailable
 */
function getFallbackData(ip) {
    return {
        ip,
        country: 'Unknown',
        countryCode: 'XX',
    };
}
/**
 * Extract client IP from request headers (for Express/Fastify)
 */
export function extractClientIP(headers) {
    // Check common headers in order of priority
    const ipSources = [
        'x-forwarded-for', // Proxy
        'x-real-ip', // Nginx
        'cf-connecting-ip', // Cloudflare
        'x-client-ip', // Other proxies
        'x-cluster-client-ip', // Load balancers
    ];
    for (const source of ipSources) {
        const value = headers[source];
        if (value) {
            // x-forwarded-for can contain multiple IPs (client, proxy1, proxy2)
            const ip = Array.isArray(value) ? value[0] : value.split(',')[0].trim();
            if (isValidIP(ip)) {
                return ip;
            }
        }
    }
    return null;
}
//# sourceMappingURL=ip-geolocation.js.map