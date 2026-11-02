import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabaseService.js';
import { AppError } from '../middleware/errorHandler.js';

export async function getHistoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!isSupabaseConfigured()) {
      return res.json({
        success: true,
        configured: false,
        message: 'Supabase credentials not configured. Investigation history is available once Supabase is connected.',
        data: [],
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized: Please log in to view investigation history', 401);
    }

    const supabase = getSupabaseClient()!;
    const { search, verdict, limit = '50', offset = '0' } = req.query;

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
      data,
      total: count,
    });
  } catch (err) {
    next(err);
  }
}

export async function saveInvestigationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!isSupabaseConfigured()) {
      return res.json({
        success: false,
        configured: false,
        message: 'Supabase credentials not configured in backend .env',
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized: Please log in to save investigations', 401);
    }

    const { intelligence, detection } = req.body;
    if (!detection || !detection.ip) {
      throw new AppError('Invalid investigation data payload', 400);
    }

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
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
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
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized', 401);
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
