import { config } from '../../config/index.js';
import { DetectionResult, DetectionVerdict, IpIntelligence } from '../../types/index.js';
import { DetectionProvider } from './detectionProvider.js';
import { logger } from '../../utils/logger.js';
import { getIpVersion } from '../../utils/ipUtils.js';

export class IpLogsAdapter implements DetectionProvider {
  public name = 'IPLogs';

  async checkIp(ip?: string): Promise<{
    detection: DetectionResult;
    intelligence?: IpIntelligence;
  }> {
    const startTime = Date.now();
    const url = config.iplogs.apiUrl;
    const apiKey = config.iplogs.apiKey;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'VPN-Proxy-Detection-System/1.0',
    };

    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    const payload = ip ? { ip: ip.trim() } : {};

    logger.info(`Sending detection request to IPLogs (${url}) for IP: ${ip || 'caller'}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.iplogs.timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        logger.warn(`IPLogs returned non-200 status (${response.status}): ${errorText}`);
        throw new Error(`IPLogs API error (${response.status}): ${errorText || response.statusText}`);
      }

      const data = await response.json();
      return this.parseResponse(data, ip);
    } catch (err: any) {
      clearTimeout(timeoutId);
      logger.error(`IPLogs request failed: ${err.message}`);
      throw err;
    }
  }

  private parseResponse(
    data: any,
    fallbackIp?: string
  ): {
    detection: DetectionResult;
    intelligence?: IpIntelligence;
  } {
    const targetIp = data.ip || data.query || fallbackIp || 'Unknown';
    const version = getIpVersion(targetIp) || 'IPv4';

    // Parse security and detection flags safely
    const isVpn = Boolean(data.vpn || data.is_vpn || data.security?.vpn);
    const isProxy = Boolean(data.proxy || data.is_proxy || data.security?.proxy);
    const isTor = Boolean(data.tor || data.is_tor || data.security?.tor);
    const isPrivacyRelay = Boolean(data.relay || data.is_relay || data.privacy_relay || data.security?.relay);
    const isHosting = Boolean(data.hosting || data.is_hosting || data.datacenter || data.security?.hosting);
    const isResidentialProxy = Boolean(data.residential_proxy || data.security?.residential_proxy);
    const isPublicProxy = Boolean(data.public_proxy || data.security?.public_proxy);
    const isDatacenterProxy = Boolean(data.datacenter_proxy || data.security?.datacenter_proxy);

    // Score / Risk calculation
    let detectionScore = 0;
    if (typeof data.score === 'number') {
      detectionScore = Math.min(100, Math.max(0, data.score));
    } else if (typeof data.risk_score === 'number') {
      detectionScore = Math.min(100, Math.max(0, data.risk_score));
    } else {
      // Heuristic fallback calculation
      if (isTor) detectionScore += 95;
      else if (isVpn) detectionScore += 80;
      else if (isProxy) detectionScore += 75;
      else if (isPrivacyRelay) detectionScore += 60;
      else if (isHosting) detectionScore += 45;
    }

    const vpnProvider =
      data.vpn_provider ||
      data.vpn_name ||
      data.provider ||
      (isVpn && data.organization ? data.organization : undefined);

    // Build signals list
    const signals: string[] = [];
    if (isTor) signals.push('Active Tor exit node directory match');
    if (isVpn) signals.push(`Commercial/Private VPN endpoint detected ${vpnProvider ? `(${vpnProvider})` : ''}`);
    if (isProxy) signals.push('Proxy server / traffic relay signature identified');
    if (isResidentialProxy) signals.push('Residential proxy network pool indicator');
    if (isPublicProxy) signals.push('Known public proxy lists match');
    if (isDatacenterProxy) signals.push('Datacenter proxy infrastructure match');
    if (isPrivacyRelay) signals.push('Privacy relay service (e.g., Apple Private Relay or secure tunneling)');
    if (isHosting) signals.push('Hosting provider / Cloud datacentre ASN allocation');

    if (data.signals && Array.isArray(data.signals)) {
      data.signals.forEach((s: any) => {
        if (typeof s === 'string' && !signals.includes(s)) signals.push(s);
      });
    }

    // Determine verdict
    let verdict: DetectionVerdict = 'Clean';
    let explanation = 'No VPN, proxy, Tor, or hosting network characteristics were detected for this IP address.';

    if (isTor) {
      verdict = 'Tor detected';
      explanation = 'This address is identified as an active Tor network exit node, allowing high anonymity traffic routing.';
    } else if (isVpn) {
      verdict = 'VPN detected';
      explanation = `Traffic originates from an active Virtual Private Network (VPN) node${vpnProvider ? ` operated by ${vpnProvider}` : ''}.`;
    } else if (isProxy) {
      verdict = 'Proxy detected';
      explanation = 'This address is flagged as an intermediary proxy server handling relayed web requests.';
    } else if (isPrivacyRelay) {
      verdict = 'Privacy relay detected';
      explanation = 'This address is associated with an encrypted privacy relay network (e.g. Apple Private Relay).';
    } else if (isHosting) {
      verdict = 'Hosting network';
      explanation = 'This IP belongs to a cloud hosting, VPS, or datacentre facility rather than a residential ISP.';
    } else if (detectionScore >= 50) {
      verdict = 'Suspicious';
      explanation = 'Elevated network risk signals detected, indicating potential proxy or tunnel activity.';
    }

    // Determine reputation
    let reputation: 'High' | 'Medium' | 'Low' | 'Dangerous' | 'Neutral' = 'Neutral';
    if (isTor) reputation = 'Dangerous';
    else if (isVpn || isProxy) reputation = 'Low';
    else if (isHosting || detectionScore >= 40) reputation = 'Medium';
    else if (detectionScore === 0) reputation = 'High';

    const detection: DetectionResult = {
      ip: targetIp,
      verdict,
      detectionScore,
      isVpn,
      isProxy,
      isResidentialProxy,
      isPublicProxy,
      isDatacenterProxy,
      isTor,
      isPrivacyRelay,
      isHosting,
      reputation,
      vpnProvider,
      signals,
      explanation,
      provider: 'IPLogs',
      providerRequestId: data.request_id || data.id,
      analyzedAt: new Date().toISOString(),
    };

    // Extract intelligence metadata
    const intelligence: IpIntelligence = {
      ip: targetIp,
      version,
      country: data.country || data.country_name,
      countryCode: data.country_code || data.countryCode,
      region: data.region || data.region_name,
      city: data.city,
      isp: data.isp,
      organization: data.org || data.organization,
      asn: data.asn ? String(data.asn) : undefined,
      asnOrg: data.asn_org || data.asn_organization || data.org,
      networkPrefix: data.network || data.prefix,
      latitude: data.latitude || data.lat,
      longitude: data.longitude || data.lon,
      isApproximateLocation: true,
    };

    return { detection, intelligence };
  }
}
