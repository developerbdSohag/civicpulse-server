import { Response } from 'express';
import User from '../models/User';
import Event from '../models/Event';
import RSVP from '../models/RSVP';
import { AuthRequest } from '../middleware/auth';

// GET /api/profile/me
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    let user = await User.findById(req.user.id).select('-password');
    if (!user && req.user.email) {
      user = await User.findOne({ email: req.user.email.toLowerCase() }).select('-password');
    }

    if (!user) {
      // Auto-create volunteer profile from auth token
      user = await User.create({
        name: req.user.name || req.user.email.split('@')[0],
        email: req.user.email.toLowerCase(),
        photoURL: req.user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(req.user.name || req.user.email)}`,
      });
    }

    const createdCount = await Event.countDocuments({ creatorEmail: user.email.toLowerCase() });
    const joinedCount = await RSVP.countDocuments({ userEmail: user.email.toLowerCase() });

    res.status(200).json({
      success: true,
      user,
      stats: {
        createdEvents: createdCount,
        joinedEvents: joinedCount,
      },
    });
  } catch (err: any) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
};

// PUT /api/profile/update
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { name, photoURL, bio, phone, location } = req.body;

    let user = await User.findById(req.user.id);
    if (!user && req.user.email) {
      user = await User.findOne({ email: req.user.email.toLowerCase() });
    }

    if (!user) {
      // Auto-create volunteer profile and apply updates
      user = new User({
        name: name || req.user.name || req.user.email.split('@')[0],
        email: req.user.email.toLowerCase(),
        photoURL: photoURL || req.user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(req.user.name || req.user.email)}`,
        bio: bio || '',
        phone: phone || '',
        location: location || '',
      });
    }

    if (name && name.trim() !== '') user.name = name.trim();
    if (photoURL !== undefined) user.photoURL = photoURL.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (location !== undefined) user.location = location.trim();

    await user.save();

    // Propagate updated creator/user name & photo in events and RSVPs if changed
    if (name || photoURL) {
      await Event.updateMany(
        { creatorEmail: user.email.toLowerCase() },
        {
          $set: {
            creatorName: user.name,
            creatorPhoto: user.photoURL,
          },
        }
      );

      await RSVP.updateMany(
        { userEmail: user.email.toLowerCase() },
        {
          $set: {
            userName: user.name,
            userPhoto: user.photoURL,
          },
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        bio: user.bio,
        location: user.location,
        phone: user.phone,
      },
    });
  } catch (err: any) {
    console.error('Error updating profile:', err);
    res.status(500).json({ success: false, message: 'Error updating profile.' });
  }
};
