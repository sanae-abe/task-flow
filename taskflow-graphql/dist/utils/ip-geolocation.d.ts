/**
 * IP Geolocation Utility
 * Fetches geographic information from IP addresses
 * Week 8: IP Geolocation implementation
 */
export interface GeolocationData {
    ip: string;
    city?: string;
    region?: string;
    country?: string;
    countryCode?: string;
    timezone?: string;
    latitude?: number;
    longitude?: number;
    org?: string;
    asn?: string;
}
export interface GeolocationOptions {
    timeout?: number;
    retries?: number;
}
/**
 * Get geolocation data for an IP address
 */
export declare function getGeolocation(ip: string, options?: GeolocationOptions): Promise<GeolocationData | null>;
/**
 * Batch get geolocation for multiple IPs
 */
export declare function getBatchGeolocation(ips: string[]): Promise<Map<string, GeolocationData | null>>;
/**
 * Clear geolocation cache
 */
export declare function clearGeolocationCache(): void;
/**
 * Get cache statistics
 */
export declare function getCacheStats(): {
    size: number;
    oldestEntry: number | null;
    newestEntry: number | null;
};
/**
 * Extract client IP from request headers (for Express/Fastify)
 */
export declare function extractClientIP(headers: Record<string, string | string[] | undefined>): string | null;
//# sourceMappingURL=ip-geolocation.d.ts.map