// types/auth.ts

import { Request } from 'express';

export interface SignupCoiffeurRequest {
  email: string;
  password: string;
  salon_name: string;
  phone: string;
  address: string;
  quartier: string;
}

export interface SignupClientRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    user_type: 'coiffeur' | 'client';
    salon_id?: string;
  };
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  user_type: 'coiffeur' | 'client';
  salon_id?: string;
  iat: number;
  exp: number;
}

// ✅ CORRIGER CECI
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    user_type: 'coiffeur' | 'client';
    salon_id?: string;
  };
}