import { isIPv4, isIPv6, classifyIPv4Scope, classifyIPv6Scope } from '../utils/ipUtils.js';
import { IpClassificationResult } from '../types/index.js';

/**
 * Classifies an IPv4 address according to historical Classful Addressing (RFC 791).
 * Also determines its scope (Public, Private, Loopback, Link-Local, Multicast, Reserved).
 * Clearly articulates that Classful Addressing is historical and modern routing uses CIDR.
 */
export function classifyIp(ip: string): IpClassificationResult {
  const trimmed = ip.trim();

  if (isIPv6(trimmed)) {
    const scope = classifyIPv6Scope(trimmed);
    return {
      ip: trimmed,
      version: 'IPv6',
      addressClass: 'N/A (IPv6)',
      scope,
      explanation:
        'IPv6 does not use historical Class A-E addressing classes. IPv6 utilizes hierarchical CIDR prefix routing (/64 host subnets, Global Unicast, Unique Local fc00::/7, and Link-Local fe80::/10).',
    };
  }

  if (!isIPv4(trimmed)) {
    throw new Error(`Invalid IP address provided for classification: ${trimmed}`);
  }

  const octets = trimmed.split('.').map(o => parseInt(o, 10));
  const firstOctet = octets[0];
  const scope = classifyIPv4Scope(trimmed);

  let addressClass: 'Class A' | 'Class B' | 'Class C' | 'Class D' | 'Class E';
  let defaultSubnetMask: string;
  let addressRange: string;
  let networkPortion: string;
  let hostPortion: string;
  let classExplanation: string;

  if (firstOctet >= 0 && firstOctet <= 127) {
    addressClass = 'Class A';
    defaultSubnetMask = '255.0.0.0 (/8)';
    addressRange = '0.0.0.0 – 127.255.255.255';
    networkPortion = `${octets[0]}.0.0.0`;
    hostPortion = `0.${octets[1]}.${octets[2]}.${octets[3]}`;
    classExplanation =
      'Class A addresses use a leading binary bit 0. The first 8 bits define the network portion, supporting up to 126 networks and 16,777,214 hosts per network. Historically assigned to massive institutions and governments.';
  } else if (firstOctet >= 128 && firstOctet <= 191) {
    addressClass = 'Class B';
    defaultSubnetMask = '255.255.0.0 (/16)';
    addressRange = '128.0.0.0 – 191.255.255.255';
    networkPortion = `${octets[0]}.${octets[1]}.0.0`;
    hostPortion = `0.0.${octets[2]}.${octets[3]}`;
    classExplanation =
      'Class B addresses use leading binary bits 10. The first 16 bits designate the network portion, allowing 16,384 networks and 65,534 hosts per network. Historically allocated to universities and large corporations.';
  } else if (firstOctet >= 192 && firstOctet <= 223) {
    addressClass = 'Class C';
    defaultSubnetMask = '255.255.255.0 (/24)';
    addressRange = '192.0.0.0 – 223.255.255.255';
    networkPortion = `${octets[0]}.${octets[1]}.${octets[2]}.0`;
    hostPortion = `0.0.0.${octets[3]}`;
    classExplanation =
      'Class C addresses use leading binary bits 110. The first 24 bits designate the network portion, providing over 2 million networks with 254 usable hosts each. Historically assigned to small businesses and local networks.';
  } else if (firstOctet >= 224 && firstOctet <= 239) {
    addressClass = 'Class D';
    defaultSubnetMask = 'N/A (Multicast)';
    addressRange = '224.0.0.0 – 239.255.255.255';
    networkPortion = 'Multicast Group ID';
    hostPortion = 'N/A';
    classExplanation =
      'Class D addresses use leading binary bits 1110. They are designated specifically for Multicast traffic (one-to-many communication such as streaming, routing protocol discovery like OSPF/RIP), with no host-network subdivision.';
  } else {
    addressClass = 'Class E';
    defaultSubnetMask = 'N/A (Experimental)';
    addressRange = '240.0.0.0 – 255.255.255.255';
    networkPortion = 'Reserved';
    hostPortion = 'N/A';
    classExplanation =
      'Class E addresses use leading binary bits 1111. Defined by RFC 1112 as experimental and reserved for future addressing research. Not routable across the public Internet.';
  }

  const explanation = `${classExplanation} [Note: Classful addressing was formally replaced by Classless Inter-Domain Routing (CIDR, RFC 1519) in 1993, but understanding classes remains foundational for network certification and subnet design.]`;

  return {
    ip: trimmed,
    version: 'IPv4',
    addressClass,
    defaultSubnetMask,
    addressRange,
    networkPortion,
    hostPortion,
    scope,
    explanation,
  };
}
