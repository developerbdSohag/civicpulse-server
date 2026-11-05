import { Response } from 'express';
import Event from '../models/Event';
import RSVP from '../models/RSVP';
import { AuthRequest } from '../middleware/auth';

// POST /api/rsvp/:eventId (Protected)
export const joinEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Please login to join this event.' });
      return;
    }

    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    // Check if event date has already passed
    if (new Date(event.eventDate) < new Date()) {
      res.status(400).json({ success: false, message: 'Cannot join past events.' });
      return;
    }

    // Check if already joined
    const userEmail = req.user.email.toLowerCase();
    const existing = await RSVP.findOne({ eventId: event._id, userEmail });

    if (existing) {
      res.status(409).json({ success: false, message: 'You have already joined this event!' });
      return;
    }

    // Create RSVP entry storing both event and user data as required
    const rsvp = await RSVP.create({
      eventId: event._id,
      eventTitle: event.title,
      eventThumbnail: event.thumbnail,
      eventLocation: event.location,
      eventType: event.eventType,
      eventDate: event.eventDate,
      userEmail: userEmail,
      userName: req.user.name,
      userPhoto: req.user.photoURL,
      joinedAt: new Date(),
    });

    // Increment event attendees count
    event.attendeesCount = (event.attendeesCount || 0) + 1;
    await event.save();

    res.status(201).json({
      success: true,
      message: `You have successfully joined "${event.title}"! See you there!`,
      rsvp,
      attendeesCount: event.attendeesCount,
    });
  } catch (err: any) {
    console.error('Error joining event:', err);
    res.status(500).json({ success: false, message: err.message || 'Error joining event.' });
  }
};

// DELETE /api/rsvp/:eventId (Protected) - Cancel RSVP
export const leaveEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { eventId } = req.params;
    const userEmail = req.user.email.toLowerCase();

    const rsvp = await RSVP.findOneAndDelete({ eventId, userEmail });

    if (!rsvp) {
      res.status(404).json({ success: false, message: 'You have not joined this event.' });
      return;
    }

    // Decrement attendees count
    const event = await Event.findById(eventId);
    if (event && event.attendeesCount > 0) {
      event.attendeesCount -= 1;
      await event.save();
    }

    res.status(200).json({
      success: true,
      message: 'You have canceled your participation for this event.',
      attendeesCount: event ? event.attendeesCount : 0,
    });
  } catch (err: any) {
    console.error('Error leaving event:', err);
    res.status(500).json({ success: false, message: 'Error canceling participation.' });
  }
};

// GET /api/rsvp/my-joined (Protected) - Sorted by event date
export const getMyJoinedEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const userEmail = req.user.email.toLowerCase();

    // Find all joined events for this user and sort by event date
    const joinedList = await RSVP.find({ userEmail })
      .populate('eventId')
      .sort({ eventDate: 1 });

    res.status(200).json({
      success: true,
      count: joinedList.length,
      joinedEvents: joinedList,
    });
  } catch (err: any) {
    console.error('Error fetching joined events:', err);
    res.status(500).json({ success: false, message: 'Error retrieving joined events.' });
  }
};
