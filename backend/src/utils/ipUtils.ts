import net from 'net';

/**
 * Validates if an IP string is a valid IPv4 address
 */
export function isIPv4(ip: string): boolean {
  return net.isIPv4(ip);
}

/**
 * Validates if an IP string is a valid IPv6 address
 */
export function isIPv6(ip: string): boolean {
  return net.isIPv6(ip);
}

/**
 * Returns IP version ('IPv4' | 'IPv6') or null if invalid
 */
export function getIpVersion(ip: string): 'IPv4' | 'IPv6' | null {
  if (isIPv4(ip)) return 'IPv4';
  if (isIPv6(ip)) return 'IPv6';
  return null;
}

/**
 * Converts dotted-decimal IPv4 to unsigned 32-bit integer
 */
export function ipv4ToInt(ip: string): number {
  return ip
    .split('.')
    .reduce((acc, octet) => ((acc << 8) + parseInt(octet, 10)) >>> 0, 0);
}

/**
 * Converts unsigned 32-bit integer to dotted-decimal IPv4
 */
export function intToIPv4(intVal: number): string {
  return [
    (intVal >>> 24) & 255,
    (intVal >>> 16) & 255,
    (intVal >>> 8) & 255,
    intVal & 255,
  ].join('.');
}

/**
 * Evaluates whether an IPv4 address falls into private, loopback, multicast, or reserved ranges.
 * Critical for SSRF (Server-Side Request Forgery) protection.
 */
export function classifyIPv4Scope(ip: string): 'Public' | 'Private' | 'Loopback' | 'Link-Local' | 'Multicast' | 'Reserved' {
  if (!isIPv4(ip)) return 'Reserved';

  const parts = ip.split('.').map(p => parseInt(p, 10));
  const [b0, b1] = parts;

  // 127.0.0.0/8 (Loopback)
  if (b0 === 127) return 'Loopback';

  // 10.0.0.0/8 (Private RFC 1918)
  if (b0 === 10) return 'Private';

  // 172.16.0.0/12 (Private RFC 1918) -> 172.16 - 172.31
  if (b0 === 172 && b1 >= 16 && b1 <= 31) return 'Private';

  // 192.168.0.0/16 (Private RFC 1918)
  if (b0 === 192 && b1 === 168) return 'Private';

  // 169.254.0.0/16 (Link-Local APIPA / Cloud Metadata 169.254.169.254)
  if (b0 === 169 && b1 === 254) return 'Link-Local';

  // 100.64.0.0/10 (Carrier-Grade NAT RFC 6598) -> 100.64 - 100.127
  if (b0 === 100 && b1 >= 64 && b1 <= 127) return 'Private';

  // 0.0.0.0/8 (Broadcast/This network)
  if (b0 === 0) return 'Reserved';

  // 224.0.0.0 to 239.255.255.255 (Multicast Class D)
  if (b0 >= 224 && b0 <= 239) return 'Multicast';

  // 240.0.0.0 to 255.255.255.255 (Reserved Class E / Limited Broadcast)
  if (b0 >= 240) return 'Reserved';

  return 'Public';
}

/**
 * Evaluates whether an IPv6 address falls into private/loopback/multicast ranges.
 */
export function classifyIPv6Scope(ip: string): 'Public' | 'Private' | 'Loopback' | 'Link-Local' | 'Multicast' | 'Reserved' {
  if (!isIPv6(ip)) return 'Reserved';

  const normalized = ip.toLowerCase();

  // ::1 / :: (Loopback / Unspecified)
  if (normalized === '::1' || normalized === '::') return 'Loopback';

  // Unique Local Address (ULA) fc00::/7 (fc00:: to fdff::)
  if (/^f[cd][0-9a-f]{2}:/i.test(normalized)) return 'Private';

  // Link-Local fe80::/10
  if (/^fe[89ab][0-9a-f]:/i.test(normalized)) return 'Link-Local';

  // Multicast ff00::/8
  if (/^ff[0-9a-f]{2}:/i.test(normalized)) return 'Multicast';

  // IPv4-mapped ::ffff:0:0/96
  if (normalized.startsWith('::ffff:')) {
    const v4Part = normalized.substring(7);
    if (isIPv4(v4Part)) {
      return classifyIPv4Scope(v4Part);
    }
  }

  return 'Public';
}

/**
 * Returns true if the IP is public and safe to query against external network intelligence.
 * Returns false if the IP is private, loopback, link-local, multicast, or reserved.
 */
export function isPublicIp(ip: string): boolean {
  const version = getIpVersion(ip);
  if (version === 'IPv4') {
    return classifyIPv4Scope(ip) === 'Public';
  } else if (version === 'IPv6') {
    return classifyIPv6Scope(ip) === 'Public';
  }
  return false;
}

/**
 * Builds the standard PTR reverse DNS query domain for an IPv4 or IPv6 address.
 * E.g., 8.8.8.8 -> 8.8.8.8.in-addr.arpa
 * E.g., 2001:4860:4860::8888 -> nibble-reversed.ip6.arpa
 */
export function buildPtrQueryDomain(ip: string): string | null {
  const version = getIpVersion(ip);
  if (version === 'IPv4') {
    const octets = ip.split('.');
    return `${octets[3]}.${octets[2]}.${octets[1]}.${octets[0]}.in-addr.arpa`;
  }

  if (version === 'IPv6') {
    // Expand IPv6 to full 32 hexadecimal characters
    const expanded = expandIPv6(ip);
    if (!expanded) return null;
    const cleanHex = expanded.replace(/:/g, '');
    const reversedNibbles = cleanHex.split('').reverse().join('.');
    return `${reversedNibbles}.ip6.arpa`;
  }

  return null;
}

/**
 * Expands compressed IPv6 address to full 8 4-hex-digit groups.
 */
export function expandIPv6(ip: string): string | null {
  if (!isIPv6(ip)) return null;

  let full = ip.toLowerCase();
  if (full.includes('::')) {
    const parts = full.split('::');
    const left = parts[0] ? parts[0].split(':') : [];
    const right = parts[1] ? parts[1].split(':') : [];
    const missing = 8 - (left.length + right.length);
    const middle = Array(missing).fill('0000');
    const all = [...left, ...middle, ...right];
    full = all.map(part => part.padStart(4, '0')).join(':');
  } else {
    full = full
      .split(':')
      .map(part => part.padStart(4, '0'))
      .join(':');
  }

  return full;
}
