import { describe, it, expect } from 'vitest';
import { calculateCidr } from '../src/services/cidrEngine.js';

describe('CIDR & Subnet Calculator Engine', () => {
  it('calculates standard /24 subnet accurately', () => {
    const res = calculateCidr('192.168.1.100/24');
    expect(res.subnetMask).toBe('255.255.255.0');
    expect(res.wildcardMask).toBe('0.0.0.255');
    expect(res.networkAddress).toBe('192.168.1.0');
    expect(res.broadcastAddress).toBe('192.168.1.255');
    expect(res.firstUsableHost).toBe('192.168.1.1');
    expect(res.lastUsableHost).toBe('192.168.1.254');
    expect(res.totalAddresses).toBe(256);
    expect(res.usableHostCount).toBe(254);
    expect(res.binarySubnet).toBe('11111111.11111111.11111111.00000000');
    expect(res.isSpecialSubnet).toBe(false);
  });

  it('calculates /16 large enterprise subnet', () => {
    const res = calculateCidr('10.50.0.1/16');
    expect(res.subnetMask).toBe('255.255.0.0');
    expect(res.networkAddress).toBe('10.50.0.0');
    expect(res.broadcastAddress).toBe('10.50.255.255');
    expect(res.firstUsableHost).toBe('10.50.0.1');
    expect(res.lastUsableHost).toBe('10.50.255.254');
    expect(res.totalAddresses).toBe(65536);
    expect(res.usableHostCount).toBe(65534);
  });

  it('handles RFC 3021 /31 point-to-point edge case correctly', () => {
    const res = calculateCidr('10.0.0.0/31');
    expect(res.subnetMask).toBe('255.255.255.254');
    expect(res.totalAddresses).toBe(2);
    expect(res.usableHostCount).toBe(2); // In /31, both addresses are usable
    expect(res.firstUsableHost).toBe('10.0.0.0');
    expect(res.lastUsableHost).toBe('10.0.0.1');
    expect(res.isSpecialSubnet).toBe(true);
  });

  it('handles /32 single host route edge case correctly', () => {
    const res = calculateCidr('192.168.1.50/32');
    expect(res.subnetMask).toBe('255.255.255.255');
    expect(res.totalAddresses).toBe(1);
    expect(res.usableHostCount).toBe(1);
    expect(res.networkAddress).toBe('192.168.1.50');
    expect(res.firstUsableHost).toBe('192.168.1.50');
    expect(res.lastUsableHost).toBe('192.168.1.50');
    expect(res.isSpecialSubnet).toBe(true);
  });

  it('throws on invalid CIDR inputs', () => {
    expect(() => calculateCidr('invalid')).toThrow();
    expect(() => calculateCidr('192.168.1.1/33')).toThrow();
    expect(() => calculateCidr('256.0.0.1/24')).toThrow();
  });
});
