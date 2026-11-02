import { Router } from 'express';
import { reverseDnsHandler } from '../controllers/dnsController.js';
import { ssrfGuard } from '../middleware/ssrfGuard.js';
import { standardRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/reverse', standardRateLimiter, ssrfGuard, reverseDnsHandler);

export default router;
