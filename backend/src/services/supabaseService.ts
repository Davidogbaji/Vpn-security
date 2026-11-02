import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(config.supabase.url && config.supabase.anonKey);
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(config.supabase.url, config.supabase.anonKey, {
        auth: {
          persistSession: false,
        },
      });
      logger.info('Supabase client initialized successfully.');
    } catch (err: any) {
      logger.error('Failed to initialize Supabase client:', err.message);
      return null;
    }
  }

  return supabaseClient;
}

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!config.supabase.url || !config.supabase.serviceRoleKey) {
    return null;
  }

  if (!supabaseAdminClient) {
    try {
      supabaseAdminClient = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      logger.info('Supabase Admin client initialized with Service Role key.');
    } catch (err: any) {
      logger.error('Failed to initialize Supabase Admin client:', err.message);
      return null;
    }
  }

  return supabaseAdminClient;
}

export async function logAuditEvent(params: {
  userId?: string | null;
  action: string;
  targetResource: string;
  ipAddress?: string;
  metadata?: any;
}) {
  const client = getSupabaseAdminClient() || getSupabaseClient();
  if (!client) {
    logger.info('[Audit Log - Local]', params);
    return;
  }

  try {
    await client.from('system_audit_logs').insert({
      user_id: params.userId || null,
      action: params.action,
      target_resource: params.targetResource,
      ip_address: params.ipAddress || null,
      metadata: params.metadata || {},
    });
  } catch (err: any) {
    logger.warn('Failed to insert audit log to Supabase:', err.message);
  }
}
