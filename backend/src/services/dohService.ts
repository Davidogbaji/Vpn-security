import { buildPtrQueryDomain, getIpVersion } from '../utils/ipUtils.js';
import { ReverseDnsResult } from '../types/index.js';
import { logger } from '../utils/logger.js';

export async function lookupReverseDns(ip: string): Promise<ReverseDnsResult> {
  const startTime = Date.now();
  const version = getIpVersion(ip);

  if (!version) {
    return {
      ip,
      ptr: null,
      status: 'INVALID_IP',
      statusCode: -1,
      resolver: 'Google Public DNS-over-HTTPS',
      responseTimeMs: 0,
      note: 'The supplied IP format is neither a valid IPv4 nor IPv6 address.',
    };
  }

  const queryDomain = buildPtrQueryDomain(ip);
  if (!queryDomain) {
    return {
      ip,
      ptr: null,
      status: 'QUERY_BUILD_FAILED',
      statusCode: -1,
      resolver: 'Google Public DNS-over-HTTPS',
      responseTimeMs: 0,
      note: 'Failed to construct reverse DNS in-addr.arpa or ip6.arpa query domain.',
    };
  }

  const dohUrl = `https://dns.google/resolve?name=${encodeURIComponent(queryDomain)}&type=PTR`;
  logger.info(`Performing DoH reverse DNS lookup for ${ip} via ${queryDomain}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(dohUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/dns-json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const durationMs = Date.now() - startTime;

    if (!response.ok) {
      return {
        ip,
        ptr: null,
        status: `HTTP_${response.status}`,
        statusCode: response.status,
        resolver: 'Google Public DNS-over-HTTPS (dns.google)',
        responseTimeMs: durationMs,
        note: `DoH resolver returned HTTP ${response.status}`,
      };
    }

    const data: any = await response.json();
    const rcode = data.Status; // 0 = NOERROR, 3 = NXDOMAIN, etc.
    let ptrHostname: string | null = null;

    if (data.Answer && Array.isArray(data.Answer) && data.Answer.length > 0) {
      // Find PTR record
      const ptrRecord = data.Answer.find((ans: any) => ans.type === 12);
      if (ptrRecord && ptrRecord.data) {
        ptrHostname = ptrRecord.data.endsWith('.') ? ptrRecord.data.slice(0, -1) : ptrRecord.data;
      }
    }

    const statusDescriptions: Record<number, string> = {
      0: 'NOERROR (Success)',
      1: 'FORMERR (Format Error)',
      2: 'SERVFAIL (Server Failure)',
      3: 'NXDOMAIN (Non-Existent Domain / No PTR Record)',
      4: 'NOTIMP (Not Implemented)',
      5: 'REFUSED (Query Refused)',
    };

    const statusText = statusDescriptions[rcode] || `RCODE_${rcode}`;
    const note = ptrHostname
      ? `Successfully resolved PTR record: ${ptrHostname}`
      : rcode === 3
      ? 'No PTR record configured by ISP/hosting provider (NXDOMAIN). Note: A missing PTR record is common on home broadband and does not necessarily indicate malicious intent.'
      : `No PTR answer returned by authoritative DNS nameserver (${statusText}).`;

    return {
      ip,
      ptr: ptrHostname,
      status: statusText,
      statusCode: rcode,
      resolver: 'Google Public DNS-over-HTTPS (dns.google)',
      responseTimeMs: durationMs,
      note,
    };
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    logger.warn(`DoH reverse DNS query timed out or failed: ${err.message}`);
    return {
      ip,
      ptr: null,
      status: 'RESOLVER_UNAVAILABLE',
      statusCode: -1,
      resolver: 'Google Public DNS-over-HTTPS (dns.google)',
      responseTimeMs: durationMs,
      note: `DNS-over-HTTPS query could not reach Google Public DNS: ${err.message}`,
    };
  }
}
