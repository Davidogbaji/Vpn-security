import { describe, it, expect } from 'vitest';
import { classifyIp } from '../src/services/ipClassifier.js';

describe('IP Address Classification Engine', () => {
  it('correctly classifies Class A addresses', () => {
    const res = classifyIp('10.0.0.1');
    expect(res.addressClass).toBe('Class A');
    expect(res.defaultSubnetMask).toContain('255.0.0.0');
    expect(res.scope).toBe('Private');
    expect(res.networkPortion).toBe('10.0.0.0');
    expect(res.hostPortion).toBe('0.0.0.1');
  });

  it('correctly classifies Class B addresses', () => {
    const res = classifyIp('172.16.5.10');
    expect(res.addressClass).toBe('Class B');
    expect(res.defaultSubnetMask).toContain('255.255.0.0');
    expect(res.scope).toBe('Private');
  });

  it('correctly classifies Class C addresses', () => {
    const res = classifyIp('192.168.1.100');
    expect(res.addressClass).toBe('Class C');
    expect(res.defaultSubnetMask).toContain('255.255.255.0');
    expect(res.scope).toBe('Private');
  });

  it('correctly classifies Class D Multicast addresses', () => {
    const res = classifyIp('224.0.0.1');
    expect(res.addressClass).toBe('Class D');
    expect(res.scope).toBe('Multicast');
  });

  it('correctly classifies Class E Experimental addresses', () => {
    const res = classifyIp('240.5.1.1');
    expect(res.addressClass).toBe('Class E');
    expect(res.scope).toBe('Reserved');
  });

  it('handles IPv6 gracefully with educational note', () => {
    const res = classifyIp('2001:4860:4860::8888');
    expect(res.addressClass).toBe('N/A (IPv6)');
    expect(res.scope).toBe('Public');
    expect(res.explanation).toContain('IPv6 does not use historical Class A-E');
  });
});
