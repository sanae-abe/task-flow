/**
 * IP Geolocation Resolvers Tests
 * Week 8: Test geolocation query resolvers
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { geolocationResolvers, clearAccessLog } from '../../resolvers/geolocation-resolvers.js';
import type { GraphQLContext } from '../../types/index.js';
import * as ipGeolocation from '../../utils/ip-geolocation.js';

// Mock the geolocation utility module
vi.mock('../../utils/ip-geolocation.js', () => ({
  getGeolocation: vi.fn(),
  extractClientIP: vi.fn(),
  clearGeolocationCache: vi.fn(),
  getCacheStats: vi.fn(),
  getBatchGeolocation: vi.fn(),
}));

describe('Geolocation Resolvers', () => {
  const mockContext: GraphQLContext = {
    headers: {
      'x-forwarded-for': '8.8.8.8',
      'user-agent': 'Test User Agent',
    },
  } as unknown as GraphQLContext;

  const mockGeolocationData = {
    ip: '8.8.8.8',
    city: 'Mountain View',
    region: 'California',
    country: 'United States',
    countryCode: 'US',
    timezone: 'America/Los_Angeles',
    latitude: 37.4056,
    longitude: -122.0775,
    org: 'Google LLC',
    asn: 'AS15169',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    clearAccessLog();

    // Setup default mock implementations
    const extractClientIPMock = vi.mocked(ipGeolocation.extractClientIP);
    extractClientIPMock.mockReturnValue('8.8.8.8');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getClientGeolocation', () => {
    it('should get geolocation for client IP', async () => {
      const getGeolocationMock = vi.mocked(ipGeolocation.getGeolocation);
      getGeolocationMock.mockResolvedValueOnce(mockGeolocationData);

      const result = await geolocationResolvers.Query.getClientGeolocation(
        null,
        {},
        mockContext
      );

      expect(result).toEqual(mockGeolocationData);
      expect(getGeolocationMock).toHaveBeenCalledWith('8.8.8.8');
    });

    it('should return null if client IP cannot be extracted', async () => {
      const contextWithoutIP: GraphQLContext = {
        headers: {},
      } as unknown as GraphQLContext;

      // Override default mock for this test
      const extractClientIPMock = vi.mocked(ipGeolocation.extractClientIP);
      extractClientIPMock.mockReturnValueOnce(null);

      const result = await geolocationResolvers.Query.getClientGeolocation(
        null,
        {},
        contextWithoutIP
      );

      expect(result).toBeNull();
    });
  });

  describe('getIPGeolocation', () => {
    it('should get geolocation for specific IP', async () => {
      const getGeolocationMock = vi.mocked(ipGeolocation.getGeolocation);
      getGeolocationMock.mockResolvedValueOnce(mockGeolocationData);

      const result = await geolocationResolvers.Query.getIPGeolocation(
        null,
        { ip: '8.8.8.8' },
        mockContext
      );

      expect(result).toEqual(mockGeolocationData);
      expect(getGeolocationMock).toHaveBeenCalledWith('8.8.8.8');
    });

    it('should handle different IP addresses', async () => {
      const cloudflareData = {
        ...mockGeolocationData,
        ip: '1.1.1.1',
        org: 'Cloudflare',
        asn: 'AS13335',
      };

      const getGeolocationMock = vi.mocked(ipGeolocation.getGeolocation);
      getGeolocationMock.mockResolvedValueOnce(cloudflareData);

      const result = await geolocationResolvers.Query.getIPGeolocation(
        null,
        { ip: '1.1.1.1' },
        mockContext
      );

      expect(result?.ip).toBe('1.1.1.1');
      expect(result?.org).toBe('Cloudflare');
    });
  });

  describe('getAccessStats', () => {
    it('should return access statistics', async () => {
      const getGeolocationMock = vi.mocked(ipGeolocation.getGeolocation);
      getGeolocationMock.mockResolvedValue(mockGeolocationData);

      // Simulate some access
      await geolocationResolvers.Query.getClientGeolocation(null, {}, mockContext);
      await geolocationResolvers.Query.getClientGeolocation(null, {}, mockContext);

      const result = await geolocationResolvers.Query.getAccessStats(
        null,
        { limit: 10 },
        mockContext
      );

      expect(result.totalRequests).toBeGreaterThan(0);
      expect(result.uniqueIPs).toBeGreaterThan(0);
      expect(result.topCountries).toBeInstanceOf(Array);
      expect(result.topCities).toBeInstanceOf(Array);
      expect(result.recentAccess).toBeInstanceOf(Array);
    });

    it('should limit top countries and cities', async () => {
      const getGeolocationMock = vi.mocked(ipGeolocation.getGeolocation);
      getGeolocationMock.mockResolvedValue(mockGeolocationData);

      // Simulate multiple access
      for (let i = 0; i < 5; i++) {
        await geolocationResolvers.Query.getClientGeolocation(null, {}, mockContext);
      }

      const result = await geolocationResolvers.Query.getAccessStats(
        null,
        { limit: 3 },
        mockContext
      );

      expect(result.topCountries.length).toBeLessThanOrEqual(3);
      expect(result.topCities.length).toBeLessThanOrEqual(3);
    });

    it('should calculate percentages correctly', async () => {
      const getGeolocationMock = vi.mocked(ipGeolocation.getGeolocation);
      getGeolocationMock.mockResolvedValue(mockGeolocationData);

      // Clear and add fresh access logs
      clearAccessLog();
      for (let i = 0; i < 10; i++) {
        await geolocationResolvers.Query.getClientGeolocation(null, {}, mockContext);
      }

      const result = await geolocationResolvers.Query.getAccessStats(
        null,
        { limit: 10 },
        mockContext
      );

      // All requests from same country, should be 100%
      if (result.topCountries.length > 0) {
        expect(result.topCountries[0].percentage).toBeCloseTo(100, 1);
      }
    });

    it('should return recent access in reverse chronological order', async () => {
      const getGeolocationMock = vi.mocked(ipGeolocation.getGeolocation);
      getGeolocationMock.mockResolvedValue(mockGeolocationData);

      clearAccessLog();
      await geolocationResolvers.Query.getClientGeolocation(null, {}, mockContext);
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      await geolocationResolvers.Query.getClientGeolocation(null, {}, mockContext);

      const result = await geolocationResolvers.Query.getAccessStats(
        null,
        { limit: 10 },
        mockContext
      );

      // Most recent should be first
      expect(result.recentAccess.length).toBeGreaterThan(0);
      if (result.recentAccess.length > 1) {
        const first = new Date(result.recentAccess[0].timestamp).getTime();
        const second = new Date(result.recentAccess[1].timestamp).getTime();
        expect(first).toBeGreaterThanOrEqual(second);
      }
    });
  });
});
