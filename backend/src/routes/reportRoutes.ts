import { Router } from 'express';
import { generateReportHandler } from '../controllers/reportController.js';
import { standardRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/generate', standardRateLimiter, generateReportHandler);

export default router;
