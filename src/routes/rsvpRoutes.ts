import { Router } from 'express';
import { joinEvent, leaveEvent, getMyJoinedEvents } from '../controllers/rsvpController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/my-joined', authenticateToken, getMyJoinedEvents);
router.post('/:eventId', authenticateToken, joinEvent);
router.delete('/:eventId', authenticateToken, leaveEvent);

export default router;
