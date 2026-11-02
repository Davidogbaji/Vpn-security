import { Router } from 'express';
import {
  getHistoryHandler,
  saveInvestigationHandler,
  getInvestigationByIdHandler,
  deleteInvestigationHandler,
} from '../controllers/historyController.js';
import { requireAuth } from '../middleware/auth.js';
import { standardRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(standardRateLimiter);

router.get('/', requireAuth, getHistoryHandler);
router.post('/save', requireAuth, saveInvestigationHandler);
router.get('/:id', requireAuth, getInvestigationByIdHandler);
router.delete('/:id', requireAuth, deleteInvestigationHandler);

export default router;
