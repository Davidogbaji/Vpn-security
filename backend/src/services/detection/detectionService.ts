import { IpLogsAdapter } from './iplogsAdapter.js';
import { lookupReverseDns } from '../dohService.js';
import { DetectionResult, IpIntelligence, DetectionVerdict } from '../../types/index.js';
import { logger } from '../../utils/logger.js';
import { getIpVersion } from '../../utils/ipUtils.js';

export class DetectionService {
  private iplogsAdapter = new IpLogsAdapter();

  /**
   * Performs complete IP intelligence and VPN/proxy detection
   */
  async analyzeIp(ip?: string): Promise<{
    detection: DetectionResult;
    intelligence: IpIntelligence;
  }> {
    // 1. First attempt primary provider: IPLogs
    try {
      const result = await this.iplogsAdapter.checkIp(ip);
      const targetIp = result.detection.ip;

      // Enrich with reverse DNS PTR if available
      try {
        const ptrResult = await lookupReverseDns(targetIp);
        if (result.intelligence) {
          result.intelligence.reverseDns = ptrResult.ptr || undefined;
        }
      } catch (dnsErr) {
        // Non-critical, continue
      }

      return {
        detection: result.detection,
        intelligence: result.intelligence || {
          ip: targetIp,
          version: getIpVersion(targetIp) || 'IPv4',
          isApproximateLocation: true,
        },
      };
    } catch (primaryErr: any) {
      logger.warn(`Primary provider (IPLogs) unavailable: ${primaryErr.message}. Executing fallback network intelligence.`);
      return this.fallbackAnalysis(ip, primaryErr.message);
    }
  }

  /**
   * Fallback using public IP intelligence APIs (e.g. IP-API + DoH PTR checks)
   * Ensures real data is retrieved even if the user has not yet obtained an IPLogs API key.
   */
  private async fallbackAnalysis(
    ip?: string,
    primaryProviderError?: string
  ): Promise<{
    detection: DetectionResult;
    intelligence: IpIntelligence;
  }> {
    const targetQuery = ip ? ip.trim() : '';
    const apiUrl = targetQuery
      ? `http://ip-api.com/json/${encodeURIComponent(targetQuery)}?fields=status,message,country,countryCode,regionName,city,lat,lon,isp,org,as,query,proxy,hosting`
      : `http://ip-api.com/json/?fields=status,message,country,countryCode,regionName,city,lat,lon,isp,org,as,query,proxy,hosting`;

    let data: any = null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const resp = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (resp.ok) {
        data = await resp.json();
      }
    } catch (e: any) {
      logger.warn(`Fallback network query failed: ${e.message}`);
    }

    const resolvedIp = data?.query || ip || '127.0.0.1';
    const version = getIpVersion(resolvedIp) || 'IPv4';

    // Reverse DNS lookup
    const ptrResult = await lookupReverseDns(resolvedIp);

    // Heuristics based on real network metadata
    const isProxy = Boolean(data?.proxy);
    const isHosting = Boolean(data?.hosting);
    const ispName = (data?.isp || '').toLowerCase();
    const orgName = (data?.org || '').toLowerCase();
    const asName = (data?.as || '').toLowerCase();
    const ptrName = (ptrResult.ptr || '').toLowerCase();

    // Check for known commercial VPN signatures in real ISP / ASN records
    const vpnKeywords = [
      'mullvad', 'nordvpn', 'expressvpn', 'surfshark', 'cyberghost', 'protonvpn',
      'pia', 'private internet access', 'windscribe', 'ovh', 'digitalocean', 'linode',
      'hetzner', 'vultr', 'aws', 'amazon', 'google cloud', 'microsoft', 'azure'
    ];

    const matchedKeyword = vpnKeywords.find(
      k => ispName.includes(k) || orgName.includes(k) || asName.includes(k) || ptrName.includes(k)
    );

    const isCloudDatacenter =
      isHosting ||
      ['digitalocean', 'linode', 'hetzner', 'vultr', 'ovh', 'aws', 'amazon', 'google', 'microsoft', 'azure', 'oracle'].some(
        c => ispName.includes(c) || orgName.includes(c) || asName.includes(c)
      );

    const isVpn = Boolean(matchedKeyword && ['mullvad', 'nordvpn', 'expressvpn', 'surfshark', 'cyberghost', 'protonvpn', 'windscribe'].includes(matchedKeyword));
    const isTor = ptrName.includes('tor-exit') || orgName.includes('tor-exit');
    const isPrivacyRelay = ispName.includes('apple') || orgName.includes('icloud private relay');

    const signals: string[] = [];
    if (isTor) signals.push('Tor exit node signature identified');
    if (isVpn) signals.push(`VPN provider keyword identified: ${matchedKeyword}`);
    if (isProxy) signals.push('Proxy / traffic tunnel header flag identified');
    if (isCloudDatacenter) signals.push('Datacentre / Cloud hosting ASN detected');
    if (isPrivacyRelay) signals.push('Encrypted privacy relay ASN match');
    if (ptrResult.ptr) signals.push(`Valid Reverse DNS PTR: ${ptrResult.ptr}`);

    let verdict: DetectionVerdict = 'Clean';
    let detectionScore = 0;
    let explanation = 'No VPN, proxy, Tor, or hosting network characteristics were detected for this IP address.';

    if (isTor) {
      verdict = 'Tor detected';
      detectionScore = 95;
      explanation = 'Address identified as an active Tor network relay node.';
    } else if (isVpn) {
      verdict = 'VPN detected';
      detectionScore = 85;
      explanation = `Commercial VPN network detected (${matchedKeyword}).`;
    } else if (isProxy) {
      verdict = 'Proxy detected';
      detectionScore = 75;
      explanation = 'Known proxy intermediary or tunnel node.';
    } else if (isPrivacyRelay) {
      verdict = 'Privacy relay detected';
      detectionScore = 60;
      explanation = 'Encrypted privacy relay routing detected.';
    } else if (isCloudDatacenter) {
      verdict = 'Hosting network';
      detectionScore = 40;
      explanation = 'Traffic originates from a cloud datacentre/hosting facility rather than standard residential broadband.';
    }

    if (signals.length === 0) {
      signals.push('Residential or enterprise broadband IP allocation');
    }

    const detection: DetectionResult = {
      ip: resolvedIp,
      verdict,
      detectionScore,
      isVpn,
      isProxy,
      isTor,
      isPrivacyRelay,
      isHosting: isCloudDatacenter,
      reputation: isTor ? 'Dangerous' : isVpn || isProxy ? 'Low' : isCloudDatacenter ? 'Medium' : 'High',
      vpnProvider: isVpn ? matchedKeyword : undefined,
      signals,
      explanation,
      provider: `Fallback Intelligence (DoH + Network DB)${primaryProviderError ? ` [IPLogs unavailable: ${primaryProviderError}]` : ''}`,
      analyzedAt: new Date().toISOString(),
    };

    const intelligence: IpIntelligence = {
      ip: resolvedIp,
      version,
      country: data?.country,
      countryCode: data?.countryCode,
      region: data?.regionName,
      city: data?.city,
      isp: data?.isp,
      organization: data?.org,
      asn: data?.as?.split(' ')[0],
      asnOrg: data?.as,
      reverseDns: ptrResult.ptr || undefined,
      latitude: data?.lat,
      longitude: data?.lon,
      isApproximateLocation: true,
    };

    return { detection, intelligence };
  }
}
