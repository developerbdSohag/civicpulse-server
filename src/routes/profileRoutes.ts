import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profileController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/me', authenticateToken, getProfile);
router.put('/update', authenticateToken, updateProfile);

export default router;
