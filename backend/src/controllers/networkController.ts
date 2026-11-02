import { Request, Response, NextFunction } from 'express';
import { calculateCidr } from '../services/cidrEngine.js';
import { classifyIp } from '../services/ipClassifier.js';
import { cidrCalculationRequestSchema, ipClassificationRequestSchema } from '../validators/index.js';

export function calculateCidrHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = cidrCalculationRequestSchema.parse(req.body);
    const result = calculateCidr(validated.cidr);

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export function classifyIpHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = ipClassificationRequestSchema.parse(req.body);
    const result = classifyIp(validated.ip);

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
