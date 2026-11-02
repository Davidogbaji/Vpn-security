import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabaseService.js';
import { localDb } from '../services/localDbService.js';
import { AppError } from '../middleware/errorHandler.js';

export async function getHistoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id || 'demo-analyst-id';
    const { search, verdict, limit = '50', offset = '0' } = req.query;

    // 1. If Supabase is not configured, seamlessly return records from local storage
    if (!isSupabaseConfigured()) {
      const records = localDb.getInvestigations(
        userId,
        typeof search === 'string' ? search : undefined,
        typeof verdict === 'string' ? verdict : undefined
      );

      return res.json({
        success: true,
        configured: false,
        storageEngine: 'Local JSON Fallback',
        data: records,
        total: records.length,
      });
    }

    // 2. Otherwise query live Supabase PostgreSQL
    const supabase = getSupabaseClient()!;

    let query = supabase
      .from('investigations')
      .select('*, detection_results(*)', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(parseInt(String(offset), 10), parseInt(String(offset), 10) + parseInt(String(limit), 10) - 1);

    if (verdict && typeof verdict === 'string') {
      query = query.eq('detection_verdict', verdict);
    }

    if (search && typeof search === 'string') {
      query = query.or(`ip_address.ilike.%${search}%,country.ilike.%${search}%,isp.ilike.%${search}%`);
    }

    const { data, count, error } = await query;
    if (error) {
      throw new AppError(`Failed to fetch history: ${error.message}`, 500);
    }

    return res.json({
      success: true,
      configured: true,
      storageEngine: 'Supabase PostgreSQL',
      data: data || [],
      total: count || 0,
    });
  } catch (err) {
    next(err);
  }
}

export async function saveInvestigationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id || 'demo-analyst-id';
    const { intelligence, detection } = req.body;
    if (!detection || !detection.ip) {
      throw new AppError('Invalid investigation data payload', 400);
    }

    // 1. If Supabase is not configured, save locally
    if (!isSupabaseConfigured()) {
      const saved = localDb.saveInvestigation(userId, intelligence, detection);
      return res.json({
        success: true,
        configured: false,
        storageEngine: 'Local JSON Fallback',
        data: saved,
      });
    }

    // 2. Otherwise save to Supabase
    const supabase = getSupabaseClient()!;

    // Insert into investigations
    const { data: investigation, error: invError } = await supabase
      .from('investigations')
      .insert({
        user_id: userId,
        ip_address: detection.ip,
        ip_version: intelligence?.version || 'IPv4',
        country: intelligence?.country,
        city: intelligence?.city,
        isp: intelligence?.isp,
        asn: intelligence?.asn,
        detection_verdict: detection.verdict,
        risk_score: detection.detectionScore || 0,
        is_vpn: Boolean(detection.isVpn),
        is_proxy: Boolean(detection.isProxy),
        is_tor: Boolean(detection.isTor),
        is_relay: Boolean(detection.isPrivacyRelay),
        is_hosting: Boolean(detection.isHosting),
      })
      .select()
      .single();

    if (invError || !investigation) {
      throw new AppError(`Failed to save investigation: ${invError?.message}`, 500);
    }

    // Insert detection_results
    await supabase.from('detection_results').insert({
      investigation_id: investigation.id,
      provider_name: detection.provider || 'IPLogs',
      provider_request_id: detection.providerRequestId || null,
      raw_signals: detection.signals || [],
      network_metadata: intelligence || {},
      explanation: detection.explanation || '',
      analyzed_at: detection.analyzedAt || new Date().toISOString(),
    });

    return res.json({
      success: true,
      data: investigation,
    });
  } catch (err) {
    next(err);
  }
}

export async function getInvestigationByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'demo-analyst-id';

    if (!isSupabaseConfigured()) {
      const records = localDb.getInvestigations(userId);
      const match = records.find((r) => r.id === id);
      if (!match) throw new AppError('Investigation record not found', 404);
      return res.json({ success: true, data: match });
    }

    const supabase = getSupabaseClient()!;
    const { data, error } = await supabase
      .from('investigations')
      .select('*, detection_results(*)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new AppError('Investigation record not found', 404);
    }

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteInvestigationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'demo-analyst-id';

    if (!isSupabaseConfigured()) {
      localDb.deleteInvestigation(id, userId);
      return res.json({
        success: true,
        message: 'Investigation record deleted from local storage',
      });
    }

    const supabase = getSupabaseClient()!;
    const { error } = await supabase
      .from('investigations')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new AppError(`Failed to delete record: ${error.message}`, 500);
    }

    return res.json({
      success: true,
      message: 'Investigation record deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}
