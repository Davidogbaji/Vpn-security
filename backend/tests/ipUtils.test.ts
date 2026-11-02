import { describe, it, expect } from 'vitest';
import {
  isIPv4,
  isIPv6,
  getIpVersion,
  isPublicIp,
  classifyIPv4Scope,
  buildPtrQueryDomain,
  expandIPv6,
} from '../src/utils/ipUtils.js';

describe('IP Utilities & Security Guards', () => {
  describe('IP Validation', () => {
    it('correctly validates IPv4 addresses', () => {
      expect(isIPv4('192.168.1.1')).toBe(true);
      expect(isIPv4('8.8.8.8')).toBe(true);
      expect(isIPv4('256.0.0.1')).toBe(false);
      expect(isIPv4('192.168.1')).toBe(false);
      expect(isIPv4('not-an-ip')).toBe(false);
    });

    it('correctly validates IPv6 addresses', () => {
      expect(isIPv6('2001:4860:4860::8888')).toBe(true);
      expect(isIPv6('::1')).toBe(true);
      expect(isIPv6('2001:db8:85a3:0:0:8a2e:370:7334')).toBe(true);
      expect(isIPv6('192.168.1.1')).toBe(false);
    });

    it('detects protocol version', () => {
      expect(getIpVersion('1.1.1.1')).toBe('IPv4');
      expect(getIpVersion('2606:4700:4700::1111')).toBe('IPv6');
      expect(getIpVersion('invalid')).toBeNull();
    });
  });

  describe('SSRF & Scope Classification', () => {
    it('classifies private RFC 1918 ranges', () => {
      expect(classifyIPv4Scope('10.0.0.1')).toBe('Private');
      expect(classifyIPv4Scope('172.20.10.5')).toBe('Private');
      expect(classifyIPv4Scope('192.168.0.1')).toBe('Private');
    });

    it('classifies loopback addresses', () => {
      expect(classifyIPv4Scope('127.0.0.1')).toBe('Loopback');
      expect(classifyIPv4Scope('127.0.1.1')).toBe('Loopback');
    });

    it('identifies cloud metadata / link-local addresses (APIPA / AWS / GCP / Azure metadata)', () => {
      expect(classifyIPv4Scope('169.254.169.254')).toBe('Link-Local');
      expect(classifyIPv4Scope('169.254.1.1')).toBe('Link-Local');
    });

    it('classifies multicast and reserved ranges', () => {
      expect(classifyIPv4Scope('224.0.0.1')).toBe('Multicast');
      expect(classifyIPv4Scope('240.0.0.1')).toBe('Reserved');
      expect(classifyIPv4Scope('0.0.0.0')).toBe('Reserved');
    });

    it('ensures only public routable IPs pass SSRF filter', () => {
      expect(isPublicIp('8.8.8.8')).toBe(true);
      expect(isPublicIp('1.1.1.1')).toBe(true);
      expect(isPublicIp('142.250.190.46')).toBe(true);

      // Private/internal must be blocked
      expect(isPublicIp('127.0.0.1')).toBe(false);
      expect(isPublicIp('10.200.1.5')).toBe(false);
      expect(isPublicIp('172.16.0.1')).toBe(false);
      expect(isPublicIp('192.168.1.254')).toBe(false);
      expect(isPublicIp('169.254.169.254')).toBe(false);
      expect(isPublicIp('::1')).toBe(false);
    });
  });

  describe('Reverse DNS (PTR) Query Construction', () => {
    it('builds valid in-addr.arpa query for IPv4', () => {
      expect(buildPtrQueryDomain('8.8.8.8')).toBe('8.8.8.8.in-addr.arpa');
      expect(buildPtrQueryDomain('1.2.3.4')).toBe('4.3.2.1.in-addr.arpa');
    });

    it('expands compressed IPv6 addresses correctly', () => {
      const expanded = expandIPv6('2001:db8::1');
      expect(expanded).toBe('2001:0db8:0000:0000:0000:0000:0000:0001');
    });

    it('builds valid ip6.arpa query for IPv6', () => {
      const ptr = buildPtrQueryDomain('2001:4860:4860::8888');
      expect(ptr).toBeDefined();
      expect(ptr?.endsWith('.ip6.arpa')).toBe(true);
    });
  });
});
