import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/profileController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/me', authenticateToken, getProfile);
router.put('/update', authenticateToken, updateProfile);
router.post('/change-password', authenticateToken, changePassword);

export default router;
