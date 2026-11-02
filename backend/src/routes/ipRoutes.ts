import { Router } from 'express';
import { getMyIpHandler, lookupIpHandler } from '../controllers/ipController.js';
import { ssrfGuard } from '../middleware/ssrfGuard.js';
import { standardRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/my-ip', standardRateLimiter, getMyIpHandler);
router.post('/lookup', standardRateLimiter, ssrfGuard, lookupIpHandler);

export default router;
