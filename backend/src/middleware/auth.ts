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
 * Extracts and verifies the Supabase JWT token from the Authorization header
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

  if (!isSupabaseConfigured()) {
    // Supabase credentials not set yet
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
 * Requires the user to be logged in
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!isSupabaseConfigured()) {
    return next(
      new AppError(
        'Authentication service is currently unconfigured. To enable user history and accounts, please provide SUPABASE_URL and SUPABASE_ANON_KEY in your backend .env file.',
        503
      )
    );
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
