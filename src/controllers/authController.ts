import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'civicpulse_jwt_secret_key_secure_2026_social_platform';

// Password requirement: uppercase letter, lowercase letter, at least 6 chars
const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter.' };
  }
  return { valid: true };
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, photoURL, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    const emailTrimmed = email.trim().toLowerCase();
    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      res.status(400).json({ success: false, message: passCheck.message });
      return;
    }

    const existingUser = await User.findOne({ email: emailTrimmed });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email already exists. Please log in.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: emailTrimmed,
      password: hashedPassword,
      photoURL: photoURL && photoURL.trim() !== '' ? photoURL.trim() : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    });

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        photoURL: user.photoURL,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        bio: user.bio,
        location: user.location,
        phone: user.phone,
      },
      token,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal server error during registration.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide both email and password.' });
      return;
    }

    const emailTrimmed = email.trim().toLowerCase();
    const user = await User.findOne({ email: emailTrimmed });

    if (!user || !user.password) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        photoURL: user.photoURL,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        bio: user.bio,
        location: user.location,
        phone: user.phone,
      },
      token,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal server error during login.' });
  }
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: 'Google email address is required.' });
      return;
    }

    const emailTrimmed = email.trim().toLowerCase();
    const user = await User.findOne({ email: emailTrimmed });

    // If user is not registered, instruct them to register first
    if (!user) {
      res.status(404).json({
        success: false,
        notRegistered: true,
        message: 'This email is not registered yet. Please register with your email ID first.',
        email: emailTrimmed,
      });
      return;
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        photoURL: user.photoURL,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}! Signed in with Google.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        bio: user.bio,
        location: user.location,
        phone: user.phone,
      },
      token,
    });
  } catch (err: any) {
    console.error('Google auth error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error processing Google sign-in.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
