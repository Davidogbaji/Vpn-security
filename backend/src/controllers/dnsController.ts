import { Request, Response, NextFunction } from 'express';
import { lookupReverseDns } from '../services/dohService.js';
import { reverseDnsRequestSchema } from '../validators/index.js';

export async function reverseDnsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = reverseDnsRequestSchema.parse(req.body);
    const targetIp = validated.ip.trim();

    const result = await lookupReverseDns(targetIp);

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
