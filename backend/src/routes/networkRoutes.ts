import { Router } from 'express';
import { calculateCidrHandler, classifyIpHandler } from '../controllers/networkController.js';
import { standardRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Note: Subnet calculations & IP class identification are offline math calculations,
// so private and educational IPs are supported without ssrfGuard.
router.post('/cidr', standardRateLimiter, calculateCidrHandler);
router.post('/classify', standardRateLimiter, classifyIpHandler);

export default router;
