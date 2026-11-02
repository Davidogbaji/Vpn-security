import { isIPv4, ipv4ToInt, intToIPv4 } from '../utils/ipUtils.js';
import { CidrCalculationResult } from '../types/index.js';

/**
 * Computes complete IPv4 Subnet and CIDR calculations.
 * Includes RFC 3021 /31 point-to-point link handling and /32 single-host handling.
 */
export function calculateCidr(cidrInput: string): CidrCalculationResult {
  const trimmed = cidrInput.trim();
  const parts = trimmed.split('/');
  if (parts.length !== 2) {
    throw new Error('Invalid CIDR format. Must be <ip>/<prefix> (e.g., 192.168.1.0/24)');
  }

  const [ipStr, prefixStr] = parts;
  if (!isIPv4(ipStr)) {
    throw new Error(`Invalid IPv4 address: ${ipStr}`);
  }

  const prefix = parseInt(prefixStr, 10);
  if (isNaN(prefix) || prefix < 0 || prefix > 32) {
    throw new Error(`Invalid CIDR prefix: ${prefixStr}. Must be an integer between 0 and 32.`);
  }

  const ipInt = ipv4ToInt(ipStr);

  // Compute 32-bit subnet mask:
  // prefix = 24 -> 32 - 24 = 8 zero bits -> (0xFFFFFFFF << (32 - prefix)) >>> 0
  const maskInt = prefix === 0 ? 0 : (((0xffffffff << (32 - prefix)) >>> 0));
  const wildcardInt = (~maskInt) >>> 0;

  const subnetMask = intToIPv4(maskInt);
  const wildcardMask = intToIPv4(wildcardInt);

  // Network address = IP bitwise AND Subnet Mask
  const networkInt = (ipInt & maskInt) >>> 0;
  const networkAddress = intToIPv4(networkInt);

  // Broadcast address = Network bitwise OR Wildcard Mask
  const broadcastInt = (networkInt | wildcardInt) >>> 0;
  const broadcastAddress = intToIPv4(broadcastInt);

  // Total addresses = 2^(32 - prefix)
  const totalAddresses = Math.pow(2, 32 - prefix);

  let firstUsableHost: string;
  let lastUsableHost: string;
  let usableHostCount: number;
  let isSpecialSubnet = false;
  let specialNote = '';

  if (prefix === 32) {
    // Single host /32
    firstUsableHost = ipStr;
    lastUsableHost = ipStr;
    usableHostCount = 1;
    isSpecialSubnet = true;
    specialNote = '/32 represents a single host route. Network, broadcast, and host addresses are identical.';
  } else if (prefix === 31) {
    // RFC 3021 Point-to-Point link
    firstUsableHost = networkAddress;
    lastUsableHost = broadcastAddress;
    usableHostCount = 2;
    isSpecialSubnet = true;
    specialNote = 'RFC 3021 allows /31 subnets for point-to-point links with 2 usable addresses (no separate broadcast).';
  } else if (prefix === 30) {
    firstUsableHost = intToIPv4(networkInt + 1);
    lastUsableHost = intToIPv4(broadcastInt - 1);
    usableHostCount = 2;
    isSpecialSubnet = false;
    specialNote = 'Traditional /30 point-to-point subnet with 2 usable hosts, 1 network ID, and 1 broadcast address.';
  } else {
    firstUsableHost = intToIPv4(networkInt + 1);
    lastUsableHost = intToIPv4(broadcastInt - 1);
    usableHostCount = totalAddresses - 2;
  }

  // Binary subnet representation
  const binarySubnet = maskInt
    .toString(2)
    .padStart(32, '0')
    .match(/.{1,8}/g)!
    .join('.');

  return {
    input: trimmed,
    ip: ipStr,
    cidrPrefix: prefix,
    subnetMask,
    wildcardMask,
    networkAddress,
    broadcastAddress,
    firstUsableHost,
    lastUsableHost,
    totalAddresses,
    usableHostCount,
    binarySubnet,
    isSpecialSubnet,
    specialNote: specialNote || undefined,
  };
}
