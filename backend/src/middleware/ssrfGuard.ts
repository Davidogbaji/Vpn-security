import { Request, Response, NextFunction } from 'express';
import { isPublicIp, getIpVersion } from '../utils/ipUtils.js';
import { AppError } from './errorHandler.js';

/**
 * SSRF (Server-Side Request Forgery) Guard Middleware
 * Ensures the backend never attempts to query live intelligence or make external HTTP calls
 * for internal localhost, RFC1918 private subnets, cloud metadata (169.254.169.254), or loopback interfaces.
 */
export function ssrfGuard(req: Request, _res: Response, next: NextFunction) {
  const ip = req.body?.ip || req.query?.ip;

  // If no IP is specified, the endpoint will evaluate the caller's public IP from request headers
  if (!ip) {
    return next();
  }

  const trimmedIp = String(ip).trim();
  const version = getIpVersion(trimmedIp);

  if (!version) {
    return next(new AppError(`Invalid IP address format: ${trimmedIp}`, 400));
  }

  // Check if IP is public
  if (!isPublicIp(trimmedIp)) {
    return next(
      new AppError(
        `Security Error (SSRF Protection): The IP ${trimmedIp} is an internal, private, loopback, or reserved address. Live external IP intelligence lookups and VPN detections are restricted to publicly routable IP addresses to prevent network reconnaissance. Use the CIDR/Subnet Calculator or IP Classification module for local network analysis.`,
        403,
        { ip: trimmedIp, reason: 'SSRF_PRIVATE_OR_RESERVED_IP' }
      )
    );
  }

  next();
}
