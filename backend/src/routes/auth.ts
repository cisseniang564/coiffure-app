// routes/auth.ts

import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import {
  SignupCoiffeurRequest,
  SignupClientRequest,
  LoginRequest,
  AuthRequest,
} from '../types/auth';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// POST /api/auth/signup-coiffeur
router.post('/signup-coiffeur', async (req: Request, res: Response) => {
  try {
    const { email, password, salon_name, phone, address, quartier } =
      req.body as SignupCoiffeurRequest;

    if (!email || !password || !salon_name || !phone || !address || !quartier) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const result = await AuthService.signupCoiffeur({
      email,
      password,
      salon_name,
      phone,
      address,
      quartier,
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Signup coiffeur error:', error);
    res.status(400).json({ error: error.message || 'Signup failed' });
  }
});

// POST /api/auth/signup-client
router.post('/signup-client', async (req: Request, res: Response) => {
  try {
    const { email, password, first_name, last_name, phone } =
      req.body as SignupClientRequest;

    if (!email || !password || !first_name || !last_name || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const result = await AuthService.signupClient({
      email,
      password,
      first_name,
      last_name,
      phone,
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Signup client error:', error);
    res.status(400).json({ error: error.message || 'Signup failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginRequest;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await AuthService.login({ email, password });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message || 'Login failed' });
  }
});

// GET /api/auth/me
router.get(
  '/me',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<any> => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      res.status(200).json({
        user: req.user,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /api/auth/logout
router.post(
  '/logout',
  authMiddleware,
  (req: AuthRequest, res: Response): any => {
    res.status(200).json({ message: 'Logged out successfully' });
  }
);

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    const result = await AuthService.refreshToken(token);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ error: 'Token refresh failed' });
  }
});

export default router;