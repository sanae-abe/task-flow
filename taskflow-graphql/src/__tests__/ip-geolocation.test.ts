/**
 * IP Geolocation Tests
 * Tests for IP geolocation utility functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getGeolocation,
  getBatchGeolocation,
  clearGeolocationCache,
  getCacheStats,
  extractClientIP,
  type GeolocationData,
} from '../utils/ip-geolocation.js';

// Mock fetch
global.fetch = vi.fn();

describe('IP Geolocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearGeolocationCache();
  });

  describe('getGeolocation', () => {
    it('should fetch geolocation data for valid IPv4 address', async () => {
      const mockResponse: GeolocationData = {
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

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ip: '8.8.8.8',
          city: 'Mountain View',
          region: 'California',
          country_name: 'United States',
          country_code: 'US',
          timezone: 'America/Los_Angeles',
          latitude: 37.4056,
          longitude: -122.0775,
          org: 'Google LLC',
          asn: 'AS15169',
        }),
      });

      const result = await getGeolocation('8.8.8.8');
      expect(result).toBeTruthy();
      expect(result?.ip).toBe('8.8.8.8');
      expect(result?.city).toBe('Mountain View');
      expect(result?.country).toBe('United States');
    });

    it('should return null for invalid IP address', async () => {
      const result = await getGeolocation('invalid-ip');
      expect(result).toBeNull();
    });

    it('should use cache for repeated requests', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ip: '1.1.1.1',
          city: 'Los Angeles',
          region: 'California',
          country_name: 'United States',
          country_code: 'US',
          timezone: 'America/Los_Angeles',
          latitude: 34.0522,
          longitude: -118.2437,
          org: 'Cloudflare',
          asn: 'AS13335',
        }),
      });

      // First request - should call fetch
      const result1 = await getGeolocation('1.1.1.1');
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second request - should use cache
      const result2 = await getGeolocation('1.1.1.1');
      expect(global.fetch).toHaveBeenCalledTimes(1); // Still 1, not 2
      expect(result1).toEqual(result2);
    });

    it('should return fallback data on API failure', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await getGeolocation('8.8.8.8', { retries: 0 });
      expect(result).toBeTruthy();
      expect(result?.ip).toBe('8.8.8.8');
      expect(result?.country).toBe('Unknown');
      expect(result?.countryCode).toBe('XX');
    });

    it('should handle timeout', async () => {
      (global.fetch as any).mockImplementationOnce(() =>
        new Promise(resolve => setTimeout(resolve, 10000))
      );

      const result = await getGeolocation('8.8.8.8', {
        timeout: 100,
        retries: 0,
      });

      // Should return fallback data on timeout
      expect(result).toBeTruthy();
      expect(result?.country).toBe('Unknown');
    });

    it('should validate IPv6 addresses', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ip: '2001:4860:4860::8888',
          city: 'Mountain View',
          region: 'California',
          country_name: 'United States',
          country_code: 'US',
          timezone: 'America/Los_Angeles',
          latitude: 37.4056,
          longitude: -122.0775,
          org: 'Google LLC',
          asn: 'AS15169',
        }),
      });

      const result = await getGeolocation('2001:4860:4860::8888');
      expect(result).toBeTruthy();
      expect(result?.ip).toBe('2001:4860:4860::8888');
    });
  });

  describe('getBatchGeolocation', () => {
    it('should fetch geolocation for multiple IPs', async () => {
      const ips = ['8.8.8.8', '1.1.1.1', '208.67.222.222'];

      (global.fetch as any).mockImplementation((url: string) => {
        const ip = url.match(/\d+\.\d+\.\d+\.\d+/)?.[0];
        return Promise.resolve({
          ok: true,
          json: async () => ({
            ip,
            city: 'Test City',
            region: 'Test Region',
            country_name: 'Test Country',
            country_code: 'TC',
            timezone: 'UTC',
            latitude: 0,
            longitude: 0,
            org: 'Test Org',
            asn: 'AS12345',
          }),
        });
      });

      const results = await getBatchGeolocation(ips);
      expect(results.size).toBe(3);
      expect(results.get('8.8.8.8')).toBeTruthy();
      expect(results.get('1.1.1.1')).toBeTruthy();
      expect(results.get('208.67.222.222')).toBeTruthy();
    });

    it('should handle mixed valid and invalid IPs', async () => {
      const ips = ['8.8.8.8', 'invalid-ip', '1.1.1.1'];

      (global.fetch as any).mockImplementation((url: string) => {
        const ip = url.match(/\d+\.\d+\.\d+\.\d+/)?.[0];
        return Promise.resolve({
          ok: true,
          json: async () => ({
            ip,
            city: 'Test City',
            country_name: 'Test Country',
            country_code: 'TC',
          }),
        });
      });

      const results = await getBatchGeolocation(ips);
      expect(results.size).toBe(3);
      expect(results.get('8.8.8.8')).toBeTruthy();
      expect(results.get('invalid-ip')).toBeNull();
      expect(results.get('1.1.1.1')).toBeTruthy();
    });
  });

  describe('Cache Management', () => {
    it('should clear cache', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ip: '8.8.8.8',
          city: 'Mountain View',
          country_name: 'United States',
          country_code: 'US',
        }),
      });

      await getGeolocation('8.8.8.8');
      let stats = getCacheStats();
      expect(stats.size).toBe(1);

      clearGeolocationCache();
      stats = getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should provide cache statistics', async () => {
      (global.fetch as any).mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({
            ip: '8.8.8.8',
            city: 'Test',
            country_name: 'Test',
            country_code: 'TC',
          }),
        })
      );

      await getGeolocation('8.8.8.8');
      await getGeolocation('1.1.1.1');

      const stats = getCacheStats();
      expect(stats.size).toBe(2);
      expect(stats.oldestEntry).toBeTruthy();
      expect(stats.newestEntry).toBeTruthy();
      expect(stats.newestEntry).toBeGreaterThanOrEqual(stats.oldestEntry!);
    });
  });

  describe('extractClientIP', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const headers = {
        'x-forwarded-for': '203.0.113.195, 70.41.3.18, 150.172.238.178',
      };
      const ip = extractClientIP(headers);
      expect(ip).toBe('203.0.113.195');
    });

    it('should extract IP from x-real-ip header', () => {
      const headers = {
        'x-real-ip': '203.0.113.195',
      };
      const ip = extractClientIP(headers);
      expect(ip).toBe('203.0.113.195');
    });

    it('should extract IP from cf-connecting-ip header (Cloudflare)', () => {
      const headers = {
        'cf-connecting-ip': '203.0.113.195',
      };
      const ip = extractClientIP(headers);
      expect(ip).toBe('203.0.113.195');
    });

    it('should prioritize headers correctly', () => {
      const headers = {
        'x-real-ip': '1.1.1.1',
        'x-forwarded-for': '2.2.2.2',
      };
      const ip = extractClientIP(headers);
      expect(ip).toBe('2.2.2.2'); // x-forwarded-for has higher priority
    });

    it('should return null for invalid headers', () => {
      const headers = {
        'x-forwarded-for': 'invalid-ip',
      };
      const ip = extractClientIP(headers);
      expect(ip).toBeNull();
    });

    it('should return null when no IP headers are present', () => {
      const headers = {
        'user-agent': 'Mozilla/5.0',
      };
      const ip = extractClientIP(headers);
      expect(ip).toBeNull();
    });
  });
});
