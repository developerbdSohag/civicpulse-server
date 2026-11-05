import { Request, Response } from 'express';
import Event from '../models/Event';
import RSVP from '../models/RSVP';
import { AuthRequest } from '../middleware/auth';

// GET /api/events
// Query params:
// - limit (e.g. 6 for home page)
// - type (e.g. 'Cleanup', 'Donation')
// - search (matches title or location)
// - sort ('date_asc', 'date_desc', 'newest')
export const getUpcomingEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit, type, search, sort } = req.query;

    const today = new Date();
    // Only show events where eventDate >= start of today
    today.setHours(0, 0, 0, 0);

    const query: any = {
      eventDate: { $gte: today },
    };

    if (type && type !== 'All') {
      query.eventType = type;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { location: searchRegex }, { description: searchRegex }];
    }

    let sortObj: any = { eventDate: 1 }; // default: nearest event first
    if (sort === 'date_desc') {
      sortObj = { eventDate: -1 };
    } else if (sort === 'newest') {
      sortObj = { createdAt: -1 };
    }

    let dbQuery = Event.find(query).sort(sortObj);

    if (limit) {
      const numLimit = parseInt(limit as string, 10);
      if (!isNaN(numLimit) && numLimit > 0) {
        dbQuery = dbQuery.limit(numLimit);
      }
    }

    const events = await dbQuery.exec();
    const totalCount = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      count: events.length,
      totalCount,
      events,
    });
  } catch (err: any) {
    console.error('Error fetching events:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve upcoming events.' });
  }
};

// GET /api/events/:id
export const getEventById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    // Check if the current requesting user has already joined
    let hasJoined = false;
    if (req.user && req.user.email) {
      const existingRsvp = await RSVP.findOne({ eventId: event._id, userEmail: req.user.email.toLowerCase() });
      if (existingRsvp) {
        hasJoined = true;
      }
    }

    // Get list of recent attendees for community social proof
    const attendees = await RSVP.find({ eventId: event._id })
      .select('userName userPhoto joinedAt userEmail')
      .sort({ joinedAt: -1 })
      .limit(12);

    res.status(200).json({
      success: true,
      event,
      hasJoined,
      attendees,
    });
  } catch (err: any) {
    console.error('Error fetching event by id:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve event details.' });
  }
};

// POST /api/events (Protected)
export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { title, description, eventType, thumbnail, location, eventDate, targetVolunteers } = req.body;

    if (!title || !description || !eventType || !thumbnail || !location || !eventDate) {
      res.status(400).json({ success: false, message: 'All event fields are required.' });
      return;
    }

    // Validate that event date is in the future
    const inputDate = new Date(eventDate);
    const now = new Date();
    if (isNaN(inputDate.getTime())) {
      res.status(400).json({ success: false, message: 'Invalid event date format.' });
      return;
    }

    if (inputDate <= now) {
      res.status(400).json({ success: false, message: 'Event date must be in the future. Past dates cannot be added.' });
      return;
    }

    const newEvent = await Event.create({
      title: title.trim(),
      description: description.trim(),
      eventType,
      thumbnail: thumbnail.trim(),
      location: location.trim(),
      eventDate: inputDate,
      targetVolunteers: targetVolunteers ? Math.max(1, parseInt(targetVolunteers, 10)) : 50,
      creatorEmail: req.user.email.toLowerCase(),
      creatorName: req.user.name,
      creatorPhoto: req.user.photoURL,
      attendeesCount: 0,
    });

    res.status(201).json({
      success: true,
      message: 'Social development event created successfully!',
      event: newEvent,
    });
  } catch (err: any) {
    console.error('Error creating event:', err);
    res.status(500).json({ success: false, message: err.message || 'Error creating event.' });
  }
};

// PUT /api/events/:id (Protected - Only creator)
export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    // Authorization check: Only creator can update
    if (event.creatorEmail.toLowerCase() !== req.user.email.toLowerCase()) {
      res.status(403).json({ success: false, message: 'Access denied. You can only edit events created by you.' });
      return;
    }

    const { title, description, eventType, thumbnail, location, eventDate, targetVolunteers } = req.body;

    if (eventDate) {
      const inputDate = new Date(eventDate);
      if (isNaN(inputDate.getTime())) {
        res.status(400).json({ success: false, message: 'Invalid event date format.' });
        return;
      }
      if (inputDate <= new Date()) {
        res.status(400).json({ success: false, message: 'Updated event date must be in the future.' });
        return;
      }
      event.eventDate = inputDate;
    }

    if (title) event.title = title.trim();
    if (description) event.description = description.trim();
    if (eventType) event.eventType = eventType;
    if (thumbnail) event.thumbnail = thumbnail.trim();
    if (location) event.location = location.trim();
    if (targetVolunteers) event.targetVolunteers = Math.max(1, parseInt(targetVolunteers, 10));

    await event.save();

    // Also update denormalized event info in RSVP collection
    await RSVP.updateMany(
      { eventId: event._id },
      {
        $set: {
          eventTitle: event.title,
          eventThumbnail: event.thumbnail,
          eventLocation: event.location,
          eventType: event.eventType,
          eventDate: event.eventDate,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: 'Event updated successfully!',
      event,
    });
  } catch (err: any) {
    console.error('Error updating event:', err);
    res.status(500).json({ success: false, message: err.message || 'Error updating event.' });
  }
};

// DELETE /api/events/:id (Protected - Only creator)
export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    // Authorization check: Only creator can delete
    if (event.creatorEmail.toLowerCase() !== req.user.email.toLowerCase()) {
      res.status(403).json({ success: false, message: 'Access denied. You can only delete events created by you.' });
      return;
    }

    await Event.findByIdAndDelete(id);
    // Also clean up RSVPs associated with this event
    await RSVP.deleteMany({ eventId: id });

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully!',
    });
  } catch (err: any) {
    console.error('Error deleting event:', err);
    res.status(500).json({ success: false, message: 'Error deleting event.' });
  }
};

// GET /api/events/manage/my-events (Protected)
export const getMyCreatedEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const events = await Event.find({ creatorEmail: req.user.email.toLowerCase() }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (err: any) {
    console.error('Error fetching my events:', err);
    res.status(500).json({ success: false, message: 'Error fetching created events.' });
  }
};
