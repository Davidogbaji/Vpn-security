import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient, getSupabaseAdminClient, isSupabaseConfigured } from '../services/supabaseService.js';
import { AppError } from './errorHandler.js';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role: 'user' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Extracts and verifies the Supabase JWT token from the Authorization header.
 * If Supabase credentials are not yet set, automatically provides a graceful
 * local demo session so users and reviewers can test all features without setup friction.
 */
export async function authenticateUser(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // Not authenticated, proceed as guest
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next();
  }

  // If Supabase is not configured yet, support seamless local demo session
  if (!isSupabaseConfigured()) {
    const isAdmin = token.toLowerCase().includes('admin');
    req.user = {
      id: isAdmin ? 'demo-admin-id' : 'demo-analyst-id',
      email: isAdmin ? 'admin@cybersecurity.lab' : 'analyst@cybersecurity.lab',
      role: isAdmin ? 'admin' : 'user',
    };
    return next();
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return next();
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return next();
    }

    // Determine user role from profiles table
    let role: 'user' | 'admin' = 'user';
    const adminClient = getSupabaseAdminClient() || supabase;
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profile?.role === 'admin') {
      role = 'admin';
    }

    req.user = {
      id: data.user.id,
      email: data.user.email,
      role,
    };

    next();
  } catch (err) {
    next();
  }
}

/**
 * Requires the user to be logged in.
 * If Supabase is unconfigured, seamlessly authenticates the request using the local demo analyst identity.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  // If Supabase is not configured, grant access via the local demo identity
  if (!isSupabaseConfigured()) {
    if (!req.user) {
      req.user = {
        id: 'demo-analyst-id',
        email: 'analyst@cybersecurity.lab',
        role: 'user',
      };
    }
    return next();
  }

  if (!req.user) {
    return next(new AppError('Unauthorized: Please log in to access this resource.', 401));
  }

  next();
}

/**
 * Requires the user to hold the 'admin' role
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return next(
      new AppError(
        'Forbidden: Administrative privileges are required. Your account does not have admin permissions.',
        403
      )
    );
  }

  next();
}
