import { Router } from 'express';
import {
  getUpcomingEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyCreatedEvents,
} from '../controllers/eventController';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getUpcomingEvents);

// Protected routes (place /manage/my-events BEFORE /:id so it doesn't get treated as an ID param)
router.get('/manage/my-events', authenticateToken, getMyCreatedEvents);

// Event details (optional auth to verify if current user already joined)
router.get('/:id', optionalAuth, getEventById);

// Create, Update, Delete (Protected)
router.post('/', authenticateToken, createEvent);
router.put('/:id', authenticateToken, updateEvent);
router.delete('/:id', authenticateToken, deleteEvent);

export default router;
