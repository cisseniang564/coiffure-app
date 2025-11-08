// services/authService.ts

import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { SignupCoiffeurRequest, SignupClientRequest, LoginRequest } from '../types/auth';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Admin key pour créer users
);

export class AuthService {
  // 1️⃣ SIGNUP COIFFEUR
  static async signupCoiffeur(data: SignupCoiffeurRequest) {
    try {
      // 1. Créer user dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          user_type: 'coiffeur',
          salon_name: data.salon_name,
        },
      });

      if (authError || !authData.user) {
        throw new Error(`Auth error: ${authError?.message}`);
      }

      const userId = authData.user.id;

      // 2. Créer salon dans DB
      const { data: salonData, error: salonError } = await supabase
        .from('salons')
        .insert({
          owner_id: userId,
          name: data.salon_name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          quartier: data.quartier,
          is_active: true,
        })
        .select()
        .single();

      if (salonError || !salonData) {
        // Rollback: delete user
        await supabase.auth.admin.deleteUser(userId);
        throw new Error(`Salon creation error: ${salonError?.message}`);
      }

      // 3. Générer JWT token
      const token = this.generateJWT({
        userId,
        email: data.email,
        user_type: 'coiffeur',
        salon_id: salonData.id,
      });

      return {
        access_token: token,
        user: {
          id: userId,
          email: data.email,
          user_type: 'coiffeur' as const,
          salon_id: salonData.id,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // 2️⃣ SIGNUP CLIENT
  static async signupClient(data: SignupClientRequest) {
    try {
      // 1. Créer user dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          user_type: 'client',
        },
      });

      if (authError || !authData.user) {
        throw new Error(`Auth error: ${authError?.message}`);
      }

      const userId = authData.user.id;

      // 2. Créer client dans DB
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          user_id: userId,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
        });

      if (clientError) {
        // Rollback
        await supabase.auth.admin.deleteUser(userId);
        throw new Error(`Client creation error: ${clientError?.message}`);
      }

      // 3. Générer JWT token
      const token = this.generateJWT({
        userId,
        email: data.email,
        user_type: 'client',
      });

      return {
        access_token: token,
        user: {
          id: userId,
          email: data.email,
          user_type: 'client' as const,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // 3️⃣ LOGIN
  static async login(data: LoginRequest) {
    try {
      // Récupérer user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError || !authData.user) {
        throw new Error('Invalid credentials');
      }

      const user = authData.user;
      const user_type = user.user_metadata?.user_type || 'client';

      // Si coiffeur, récupérer salon_id
      let salon_id: string | undefined;
      if (user_type === 'coiffeur') {
        const { data: salonData } = await supabase
          .from('salons')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        salon_id = salonData?.id;
      }

      // Générer JWT token
      const token = this.generateJWT({
        userId: user.id,
        email: user.email!,
        user_type,
        salon_id,
      });

      return {
        access_token: token,
        user: {
          id: user.id,
          email: user.email!,
          user_type,
          salon_id,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // 4️⃣ VERIFY JWT & GET CURRENT USER
  static async getCurrentUser(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      // Vérifier que user existe toujours
      const { data: user, error } = await supabase.auth.admin.getUserById(decoded.sub);

      if (error || !user) {
        throw new Error('User not found');
      }

      return {
        id: decoded.sub,
        email: decoded.email,
        user_type: decoded.user_type,
        salon_id: decoded.salon_id,
      };
    } catch (error) {
      throw error;
    }
  }

  // 5️⃣ GENERATE JWT TOKEN
  private static generateJWT(payload: {
    userId: string;
    email: string;
    user_type: 'coiffeur' | 'client';
    salon_id?: string;
  }) {
    const token = jwt.sign(
      {
        sub: payload.userId,
        email: payload.email,
        user_type: payload.user_type,
        salon_id: payload.salon_id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: process.env.JWT_EXPIRY || '7d',
      }
    );

    return token;
  }

  // 6️⃣ REFRESH TOKEN (optional, for later)
  static async refreshToken(oldToken: string) {
    try {
      const decoded = jwt.verify(oldToken, process.env.JWT_SECRET!, {
        ignoreExpiration: true,
      }) as any;

      // Régénérer token
      const newToken = this.generateJWT({
        userId: decoded.sub,
        email: decoded.email,
        user_type: decoded.user_type,
        salon_id: decoded.salon_id,
      });

      return { access_token: newToken };
    } catch (error) {
      throw error;
    }
  }
}