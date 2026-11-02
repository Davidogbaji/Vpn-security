import { Router } from 'express';
import { getAdminOverviewHandler } from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { standardRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/overview', standardRateLimiter, requireAuth, requireAdmin, getAdminOverviewHandler);

export default router;
