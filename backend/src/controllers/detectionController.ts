import { Request, Response, NextFunction } from 'express';
import { DetectionService } from '../services/detection/detectionService.js';
import { detectionCheckRequestSchema, bulkDetectionRequestSchema } from '../validators/index.js';
import { extractClientIp } from './ipController.js';
import { isPublicIp, getIpVersion } from '../utils/ipUtils.js';
import { BulkAnalysisItemResult, BulkAnalysisSummary } from '../types/index.js';
import { logAuditEvent } from '../services/supabaseService.js';

const detectionService = new DetectionService();

export async function checkDetectionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = detectionCheckRequestSchema.parse(req.body);
    const targetIp = validated.ip?.trim() || extractClientIp(req);

    const result = await detectionService.analyzeIp(targetIp);

    // Audit log if user is authenticated
    if (req.user) {
      logAuditEvent({
        userId: req.user.id,
        action: 'DETECTION_CHECK',
        targetResource: targetIp,
        metadata: { verdict: result.detection.verdict, score: result.detection.detectionScore },
      });
    }

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function bulkDetectionHandler(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  try {
    const validated = bulkDetectionRequestSchema.parse(req.body);
    const rawIps = validated.ips;

    // Deduplicate and trim
    const uniqueIps = Array.from(new Set(rawIps.map(i => i.trim()).filter(Boolean)));

    const results: BulkAnalysisItemResult[] = [];
    let cleanCount = 0;
    let vpnCount = 0;
    let proxyCount = 0;
    let torCount = 0;
    let hostingCount = 0;
    let suspiciousCount = 0;
    let invalidCount = 0;

    // Process in controlled sequence / small chunks to respect provider limits
    for (const ip of uniqueIps) {
      const version = getIpVersion(ip);
      if (!version) {
        invalidCount++;
        results.push({
          ip,
          valid: false,
          error: 'Invalid IP address syntax',
        });
        continue;
      }

      if (!isPublicIp(ip)) {
        invalidCount++;
        results.push({
          ip,
          valid: false,
          error: 'Private, loopback, or reserved IP (SSRF protection)',
        });
        continue;
      }

      try {
        const { detection, intelligence } = await detectionService.analyzeIp(ip);

        if (detection.isTor) torCount++;
        else if (detection.isVpn) vpnCount++;
        else if (detection.isProxy) proxyCount++;
        else if (detection.isHosting) hostingCount++;
        else if (detection.verdict === 'Suspicious') suspiciousCount++;
        else cleanCount++;

        results.push({
          ip,
          valid: true,
          detection,
          intelligence,
        });
      } catch (err: any) {
        results.push({
          ip,
          valid: false,
          error: err.message || 'Lookup failed',
        });
        invalidCount++;
      }
    }

    const summary: BulkAnalysisSummary = {
      total: uniqueIps.length,
      processed: results.length,
      clean: cleanCount,
      vpn: vpnCount,
      proxy: proxyCount,
      tor: torCount,
      hosting: hostingCount,
      suspicious: suspiciousCount,
      invalid: invalidCount,
      durationMs: Date.now() - startTime,
    };

    if (req.user) {
      logAuditEvent({
        userId: req.user.id,
        action: 'BULK_DETECTION',
        targetResource: `${uniqueIps.length} IPs`,
        metadata: { summary },
      });
    }

    return res.json({
      success: true,
      data: {
        summary,
        results,
      },
    });
  } catch (err) {
    next(err);
  }
}
