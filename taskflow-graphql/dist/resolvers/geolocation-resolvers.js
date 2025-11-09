/**
 * IP Geolocation Resolvers
 * Week 8: IP geolocation and access statistics
 */
import { getGeolocation, extractClientIP, } from '../utils/ip-geolocation.js';
const accessLogs = [];
const MAX_LOG_SIZE = 1000; // Keep last 1000 entries
// ============================================================================
// Resolvers
// ============================================================================
export const geolocationResolvers = {
    Query: {
        /**
         * Get geolocation data for client IP
         */
        async getClientGeolocation(_parent, _args, context) {
            const clientIP = extractClientIP(context.headers);
            if (!clientIP) {
                console.warn('Unable to extract client IP from request headers');
                return null;
            }
            // Log access
            logAccess(clientIP, context.headers['user-agent'], 'getClientGeolocation');
            const geolocation = await getGeolocation(clientIP);
            return geolocation;
        },
        /**
         * Get geolocation data for specific IP
         */
        async getIPGeolocation(_parent, args, context) {
            const { ip } = args;
            // Log access
            const clientIP = extractClientIP(context.headers);
            if (clientIP) {
                logAccess(clientIP, context.headers['user-agent'], `getIPGeolocation:${ip}`);
            }
            const geolocation = await getGeolocation(ip);
            return geolocation;
        },
        /**
         * Get access statistics with geolocation data
         */
        async getAccessStats(_parent, args, _context) {
            const limit = args.limit || 10;
            // Calculate statistics
            const totalRequests = accessLogs.length;
            const uniqueIPs = new Set(accessLogs.map(log => log.ip)).size;
            // Top countries
            const countryCount = new Map();
            const countryData = new Map();
            accessLogs.forEach(log => {
                if (log.geolocation?.country && log.geolocation?.countryCode) {
                    const key = log.geolocation.countryCode;
                    countryCount.set(key, (countryCount.get(key) || 0) + 1);
                    countryData.set(key, {
                        country: log.geolocation.country,
                        code: log.geolocation.countryCode,
                    });
                }
            });
            const topCountries = Array.from(countryCount.entries())
                .map(([code, count]) => ({
                country: countryData.get(code)?.country || 'Unknown',
                countryCode: code,
                count,
                percentage: (count / totalRequests) * 100,
            }))
                .sort((a, b) => b.count - a.count)
                .slice(0, limit);
            // Top cities
            const cityCount = new Map();
            const cityData = new Map();
            accessLogs.forEach(log => {
                if (log.geolocation?.city && log.geolocation?.country) {
                    const key = `${log.geolocation.city},${log.geolocation.country}`;
                    cityCount.set(key, (cityCount.get(key) || 0) + 1);
                    cityData.set(key, {
                        city: log.geolocation.city,
                        country: log.geolocation.country,
                    });
                }
            });
            const topCities = Array.from(cityCount.entries())
                .map(([key, count]) => ({
                city: cityData.get(key)?.city || 'Unknown',
                country: cityData.get(key)?.country || 'Unknown',
                count,
                percentage: (count / totalRequests) * 100,
            }))
                .sort((a, b) => b.count - a.count)
                .slice(0, limit);
            // Recent access (last 20)
            const recentAccess = accessLogs
                .slice(-20)
                .reverse()
                .map(log => ({
                id: log.id,
                ip: log.ip,
                geolocation: log.geolocation,
                userAgent: log.userAgent,
                endpoint: log.endpoint,
                timestamp: log.timestamp.toISOString(),
            }));
            return {
                totalRequests,
                uniqueIPs,
                topCountries,
                topCities,
                recentAccess,
            };
        },
    },
};
// ============================================================================
// Helper Functions
// ============================================================================
/**
 * Log access with geolocation lookup
 */
async function logAccess(ip, userAgent, endpoint) {
    const geolocation = await getGeolocation(ip);
    const logEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ip,
        geolocation,
        userAgent,
        endpoint,
        timestamp: new Date(),
    };
    accessLogs.push(logEntry);
    // Trim log if too large
    if (accessLogs.length > MAX_LOG_SIZE) {
        accessLogs.shift(); // Remove oldest entry
    }
}
/**
 * Get access log for testing/debugging
 */
export function getAccessLog() {
    return [...accessLogs];
}
/**
 * Clear access log (for testing)
 */
export function clearAccessLog() {
    accessLogs.length = 0;
}
//# sourceMappingURL=geolocation-resolvers.js.map