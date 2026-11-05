import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    photoURL?: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'civicpulse_jwt_secret_key_secure_2026_social_platform';

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      res.status(403).json({ success: false, message: 'Invalid or expired session token.' });
      return;
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      photoURL: decoded.photoURL,
    };
    next();
  });
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (_err, decoded: any) => {
    if (decoded) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        photoURL: decoded.photoURL,
      };
    }
    next();
  });
};
