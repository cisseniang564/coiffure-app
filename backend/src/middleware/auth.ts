// middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload, AuthRequest } from '../types/auth';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.slice(7);

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      user_type: decoded.user_type,
      salon_id: decoded.salon_id,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const isCoiffeurMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.user_type !== 'coiffeur') {
    return res.status(403).json({ error: 'Only coiffeurs can access this' });
  }
  next();
};

export const isClientMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.user_type !== 'client') {
    return res.status(403).json({ error: 'Only clients can access this' });
  }
  next();
};