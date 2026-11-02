import { z } from 'zod';
import { isIPv4, isIPv6 } from '../utils/ipUtils.js';

// Custom validator for IPv4 or IPv6
export const ipAddressSchema = z.string().refine(
  (val) => isIPv4(val.trim()) || isIPv6(val.trim()),
  { message: 'Invalid IP address. Must be a valid IPv4 (e.g. 8.8.8.8) or IPv6 (e.g. 2001:4860:4860::8888).' }
);

// IPv4 specific validator
export const ipv4AddressSchema = z.string().refine(
  (val) => isIPv4(val.trim()),
  { message: 'Invalid IPv4 address. Must be in standard dotted-decimal format (e.g. 192.168.1.1).' }
);

// CIDR format validator (e.g. "192.168.1.0/24")
export const cidrSchema = z.string().refine(
  (val) => {
    const parts = val.trim().split('/');
    if (parts.length !== 2) return false;
    const [ip, prefixStr] = parts;
    if (!isIPv4(ip)) return false;
    const prefix = parseInt(prefixStr, 10);
    return !isNaN(prefix) && prefix >= 0 && prefix <= 32;
  },
  { message: 'Invalid CIDR notation. Must be in IPv4 format with prefix 0-32 (e.g. 192.168.1.0/24).' }
);

// Request Schemas
export const ipLookupRequestSchema = z.object({
  ip: ipAddressSchema.optional(),
  allowPrivate: z.boolean().optional().default(false),
});

export const detectionCheckRequestSchema = z.object({
  ip: ipAddressSchema.optional(),
});

export const bulkDetectionRequestSchema = z.object({
  ips: z.array(z.string()).min(1, 'Please provide at least one IP address').max(50, 'Free tier limit: maximum 50 IP addresses per batch'),
});

export const reverseDnsRequestSchema = z.object({
  ip: ipAddressSchema,
});

export const cidrCalculationRequestSchema = z.object({
  cidr: cidrSchema,
});

export const ipClassificationRequestSchema = z.object({
  ip: ipAddressSchema,
});

export const reportGenerationRequestSchema = z.object({
  format: z.enum(['pdf', 'docx', 'csv', 'json']),
  investigation: z.object({
    ip: z.string(),
    ipVersion: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    isp: z.string().optional(),
    asn: z.string().optional(),
    verdict: z.string(),
    detectionScore: z.number().optional(),
    isVpn: z.boolean().optional(),
    isProxy: z.boolean().optional(),
    isTor: z.boolean().optional(),
    isPrivacyRelay: z.boolean().optional(),
    isHosting: z.boolean().optional(),
    vpnProvider: z.string().optional(),
    signals: z.array(z.string()).optional(),
    reverseDns: z.string().optional().nullable(),
    analyzedAt: z.string().optional(),
    explanation: z.string().optional(),
  }),
});
