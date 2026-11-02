export type DetectionVerdict =
  | 'Clean'
  | 'Suspicious'
  | 'VPN likely'
  | 'VPN detected'
  | 'Proxy detected'
  | 'Tor detected'
  | 'Privacy relay detected'
  | 'Hosting network'
  | 'Inconclusive';

export interface IpIntelligence {
  ip: string;
  version: 'IPv4' | 'IPv6';
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  isp?: string;
  organization?: string;
  asn?: string;
  asnOrg?: string;
  networkPrefix?: string;
  reverseDns?: string;
  latitude?: number;
  longitude?: number;
  isApproximateLocation: boolean;
}

export interface DetectionResult {
  ip: string;
  verdict: DetectionVerdict;
  detectionScore: number;
  isVpn: boolean;
  isProxy: boolean;
  isResidentialProxy?: boolean;
  isPublicProxy?: boolean;
  isDatacenterProxy?: boolean;
  isTor: boolean;
  isPrivacyRelay: boolean;
  isHosting: boolean;
  reputation: 'High' | 'Medium' | 'Low' | 'Dangerous' | 'Neutral';
  vpnProvider?: string;
  signals: string[];
  explanation: string;
  provider: string;
  providerRequestId?: string;
  analyzedAt: string;
}

export interface ReverseDnsResult {
  ip: string;
  ptr: string | null;
  status: string;
  statusCode: number;
  resolver: string;
  responseTimeMs: number;
  note: string;
}

export interface CidrCalculationResult {
  input: string;
  ip: string;
  cidrPrefix: number;
  subnetMask: string;
  wildcardMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableHost: string;
  lastUsableHost: string;
  totalAddresses: number;
  usableHostCount: number;
  binarySubnet: string;
  isSpecialSubnet: boolean;
  specialNote?: string;
}

export interface IpClassificationResult {
  ip: string;
  version: 'IPv4' | 'IPv6';
  addressClass: 'Class A' | 'Class B' | 'Class C' | 'Class D' | 'Class E' | 'N/A (IPv6)';
  defaultSubnetMask?: string;
  addressRange?: string;
  networkPortion?: string;
  hostPortion?: string;
  scope: 'Public' | 'Private' | 'Loopback' | 'Link-Local' | 'Multicast' | 'Reserved';
  explanation: string;
}

export interface BulkAnalysisItemResult {
  ip: string;
  valid: boolean;
  error?: string;
  intelligence?: IpIntelligence;
  detection?: DetectionResult;
}

export interface BulkAnalysisSummary {
  total: number;
  processed: number;
  clean: number;
  vpn: number;
  proxy: number;
  tor: number;
  hosting: number;
  suspicious: number;
  invalid: number;
  durationMs: number;
}

export interface WebRtcCandidate {
  candidate: string;
  ip: string;
  type: string; // 'host' | 'srflx' | 'relay'
  protocol: string;
}

export interface LeakAnalysisResult {
  publicIp: string;
  ipv4Available: boolean;
  ipv6Available: boolean;
  ipv6Address?: string;
  webrtcCandidates: WebRtcCandidate[];
  webrtcLeakDetected: boolean;
  webrtcExposedIps: string[];
  dnsResolverStatus: string;
  possibleLeaks: string[];
  recommendations: string[];
}

export interface SavedInvestigation {
  id: string;
  user_id: string;
  ip_address: string;
  ip_version: string;
  country?: string;
  city?: string;
  isp?: string;
  asn?: string;
  detection_verdict: string;
  risk_score: number;
  is_vpn: boolean;
  is_proxy: boolean;
  is_tor: boolean;
  is_relay: boolean;
  is_hosting: boolean;
  created_at: string;
  detection_results?: {
    provider_name: string;
    raw_signals: string[];
    network_metadata: any;
    explanation: string;
  }[];
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  role: 'user' | 'admin';
}
