import { Router } from 'express';
import { checkDetectionHandler, bulkDetectionHandler } from '../controllers/detectionController.js';
import { ssrfGuard } from '../middleware/ssrfGuard.js';
import { standardRateLimiter, bulkRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/check', standardRateLimiter, ssrfGuard, checkDetectionHandler);
router.post('/bulk', bulkRateLimiter, bulkDetectionHandler);

export default router;
