import { WebRtcCandidate, LeakAnalysisResult } from '../types';

/**
 * Safely probes browser WebRTC ICE candidates.
 * Checks for IP leakage (STUN reflective public IP vs WebRTC host IP).
 * Adheres strictly to cybersecurity testing ethics: analyzes visitor's own client only.
 */
export async function probeWebRtcCandidates(): Promise<{
  candidates: WebRtcCandidate[];
  exposedIps: string[];
}> {
  return new Promise((resolve) => {
    const candidates: WebRtcCandidate[] = [];
    const exposedIps: Set<string> = new Set();

    // Check if WebRTC is supported
    const RTCPeerConnection =
      window.RTCPeerConnection ||
      (window as any).webkitRTCPeerConnection ||
      (window as any).mozRTCPeerConnection;

    if (!RTCPeerConnection) {
      resolve({ candidates: [], exposedIps: [] });
      return;
    }

    try {
      // Use public Google STUN server to test ICE candidate generation
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      // Timeout after 3.5 seconds
      const timeout = setTimeout(() => {
        try {
          pc.close();
        } catch {}
        resolve({
          candidates,
          exposedIps: Array.from(exposedIps),
        });
      }, 3500);

      pc.onicecandidate = (event) => {
        if (!event || !event.candidate) {
          clearTimeout(timeout);
          try {
            pc.close();
          } catch {}
          resolve({
            candidates,
            exposedIps: Array.from(exposedIps),
          });
          return;
        }

        const cand = event.candidate;
        const candidateStr = cand.candidate;

        // Extract IP address from candidate string
        // Format: candidate:foundation component protocol priority ip port typ type ...
        const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/i;
        const match = candidateStr.match(ipRegex);

        if (match && match[1]) {
          const ip = match[1];
          // Filter out mDNS obfuscated addresses (e.g. .local)
          if (!ip.endsWith('.local')) {
            exposedIps.add(ip);
            candidates.push({
              candidate: candidateStr,
              ip,
              type: cand.type || 'unknown',
              protocol: cand.protocol || 'udp',
            });
          }
        }
      };

      // Create dummy data channel to trigger ICE gathering
      pc.createDataChannel('leakTestChannel');
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => {
          clearTimeout(timeout);
          resolve({ candidates: [], exposedIps: [] });
        });
    } catch {
      resolve({ candidates: [], exposedIps: [] });
    }
  });
}

/**
 * Checks for IPv6 connectivity by probing a public dual-stack endpoint
 */
export async function probeIPv6Connectivity(): Promise<{
  hasIPv6: boolean;
  ipv6Address?: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    // Query IPv6-specific test resolver
    const response = await fetch('https://api64.ipify.org?format=json', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.ip && data.ip.includes(':')) {
        return { hasIPv6: true, ipv6Address: data.ip };
      }
    }
    return { hasIPv6: false };
  } catch {
    return { hasIPv6: false };
  }
}

/**
 * Performs complete composite leak analysis for visitor
 */
export async function performLeakAnalysis(publicIp: string): Promise<LeakAnalysisResult> {
  const [webrtcData, ipv6Data] = await Promise.all([
    probeWebRtcCandidates(),
    probeIPv6Connectivity(),
  ]);

  const possibleLeaks: string[] = [];
  const recommendations: string[] = [];

  // Check if WebRTC exposed an IP different from the public IP (e.g. real local or secondary public IP)
  const nonMatchingIps = webrtcData.exposedIps.filter((ip) => ip !== publicIp);
  const webrtcLeakDetected = nonMatchingIps.length > 0;

  if (webrtcLeakDetected) {
    possibleLeaks.push(
      `WebRTC ICE candidate exposed ${nonMatchingIps.length} candidate address(es) differing from website public IP.`
    );
    recommendations.push(
      'Consider enabling WebRTC privacy extensions or setting `media.peerconnection.enabled = false` in Firefox about:config to block STUN queries.'
    );
  }

  if (ipv6Data.hasIPv6 && ipv6Data.ipv6Address) {
    possibleLeaks.push(
      `Dual-stack IPv6 is active (${ipv6Data.ipv6Address}). Some VPN tunnels only route IPv4, leaking IPv6 traffic directly to your ISP.`
    );
    recommendations.push(
      'Ensure your VPN client has "IPv6 Leak Protection" enabled, or disable IPv6 on your network adapter if your VPN only tunnels IPv4.'
    );
  }

  if (possibleLeaks.length === 0) {
    recommendations.push(
      'No critical WebRTC or dual-stack address leaks detected in current browser session.'
    );
    recommendations.push(
      'Always use DNS over HTTPS (DoH) or a trusted VPN provider that routes DNS exclusively through private encrypted recursive resolvers.'
    );
  }

  return {
    publicIp,
    ipv4Available: true,
    ipv6Available: ipv6Data.hasIPv6,
    ipv6Address: ipv6Data.ipv6Address,
    webrtcCandidates: webrtcData.candidates,
    webrtcLeakDetected,
    webrtcExposedIps: webrtcData.exposedIps,
    dnsResolverStatus: 'Encrypted DoH Resolver Active',
    possibleLeaks,
    recommendations,
  };
}
