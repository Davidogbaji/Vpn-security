import { Request, Response, NextFunction } from 'express';
import { DetectionService } from '../services/detection/detectionService.js';
import { ipLookupRequestSchema } from '../validators/index.js';
import { isPublicIp, getIpVersion } from '../utils/ipUtils.js';

const detectionService = new DetectionService();

/**
 * Helper to extract client's real public IP from headers
 */
export function extractClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const list = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    const clientIp = list.trim();
    if (getIpVersion(clientIp)) return clientIp;
  }

  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && getIpVersion(realIp.trim())) {
    return realIp.trim();
  }

  const socketIp = req.socket.remoteAddress;
  if (socketIp) {
    // Normalize IPv4-mapped IPv6 (::ffff:127.0.0.1 -> 127.0.0.1)
    if (socketIp.startsWith('::ffff:')) {
      return socketIp.substring(7);
    }
    return socketIp;
  }

  return '127.0.0.1';
}

export async function getMyIpHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const clientIp = extractClientIp(req);
    const isPublic = isPublicIp(clientIp);

    // If client IP is localhost / private (common during local development),
    // we query without passing client IP so the provider evaluates our egress IP
    const analysis = await detectionService.analyzeIp(isPublic ? clientIp : undefined);

    return res.json({
      success: true,
      data: {
        ip: analysis.intelligence.ip || clientIp,
        isLocalDevelopmentIp: !isPublic,
        intelligence: analysis.intelligence,
        detection: analysis.detection,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function lookupIpHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = ipLookupRequestSchema.parse(req.body);
    const targetIp = validated.ip?.trim() || extractClientIp(req);

    const analysis = await detectionService.analyzeIp(targetIp);

    return res.json({
      success: true,
      data: {
        ip: targetIp,
        intelligence: analysis.intelligence,
        detection: analysis.detection,
      },
    });
  } catch (err) {
    next(err);
  }
}
