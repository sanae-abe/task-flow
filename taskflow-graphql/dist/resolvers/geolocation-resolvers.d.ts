/**
 * IP Geolocation Resolvers
 * Week 8: IP geolocation and access statistics
 */
import type { GraphQLContext } from '../types/index.js';
import { type GeolocationData } from '../utils/ip-geolocation.js';
interface AccessLogEntry {
    id: string;
    ip: string;
    geolocation: GeolocationData | null;
    userAgent: string;
    endpoint: string;
    timestamp: Date;
}
export declare const geolocationResolvers: {
    Query: {
        /**
         * Get geolocation data for client IP
         */
        getClientGeolocation(_parent: unknown, _args: unknown, context: GraphQLContext): Promise<GeolocationData | null>;
        /**
         * Get geolocation data for specific IP
         */
        getIPGeolocation(_parent: unknown, args: {
            ip: string;
        }, context: GraphQLContext): Promise<GeolocationData | null>;
        /**
         * Get access statistics with geolocation data
         */
        getAccessStats(_parent: unknown, args: {
            limit?: number;
        }, _context: GraphQLContext): Promise<{
            totalRequests: number;
            uniqueIPs: number;
            topCountries: {
                country: string;
                countryCode: string;
                count: number;
                percentage: number;
            }[];
            topCities: {
                city: string;
                country: string;
                count: number;
                percentage: number;
            }[];
            recentAccess: {
                id: string;
                ip: string;
                geolocation: GeolocationData | null;
                userAgent: string;
                endpoint: string;
                timestamp: string;
            }[];
        }>;
    };
};
/**
 * Get access log for testing/debugging
 */
export declare function getAccessLog(): AccessLogEntry[];
/**
 * Clear access log (for testing)
 */
export declare function clearAccessLog(): void;
export {};
//# sourceMappingURL=geolocation-resolvers.d.ts.map