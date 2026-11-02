import { Request, Response, NextFunction } from 'express';
import { getSupabaseAdminClient, isSupabaseConfigured } from '../services/supabaseService.js';
import { config } from '../config/index.js';

export async function getAdminOverviewHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const memory = process.memoryUsage();
    const systemHealth = {
      status: 'OPERATIONAL',
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      environment: config.nodeEnv,
      memory: {
        rssMb: Math.round(memory.rss / 1024 / 1024),
        heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
      },
      services: {
        iplogsApi: {
          configured: Boolean(config.iplogs.apiKey),
          url: config.iplogs.apiUrl,
        },
        supabase: {
          configured: isSupabaseConfigured(),
          url: config.supabase.url ? 'Connected' : 'Not configured',
        },
        googleDoh: {
          url: config.doh.googleDnsUrl,
          status: 'Available',
        },
      },
    };

    if (!isSupabaseConfigured()) {
      return res.json({
        success: true,
        data: {
          metrics: {
            totalUsers: 0,
            totalInvestigations: 0,
            vpnDetections: 0,
            proxyDetections: 0,
            torDetections: 0,
          },
          systemHealth,
          recentLogs: [],
          note: 'Supabase is not configured yet. Configure Supabase in backend/.env to view live database statistics.',
        },
      });
    }

    const adminClient = getSupabaseAdminClient();
    if (!adminClient) {
      return res.status(503).json({
        success: false,
        error: 'Supabase Service Role Key required for administrative overview',
      });
    }

    // Query aggregated statistics
    const [usersResult, invResult, vpnResult, proxyResult, torResult, logsResult] = await Promise.all([
      adminClient.from('profiles').select('id', { count: 'exact', head: true }),
      adminClient.from('investigations').select('id', { count: 'exact', head: true }),
      adminClient.from('investigations').select('id', { count: 'exact', head: true }).eq('is_vpn', true),
      adminClient.from('investigations').select('id', { count: 'exact', head: true }).eq('is_proxy', true),
      adminClient.from('investigations').select('id', { count: 'exact', head: true }).eq('is_tor', true),
      adminClient.from('system_audit_logs').select('*').order('created_at', { ascending: false }).limit(20),
    ]);

    return res.json({
      success: true,
      data: {
        metrics: {
          totalUsers: usersResult.count || 0,
          totalInvestigations: invResult.count || 0,
          vpnDetections: vpnResult.count || 0,
          proxyDetections: proxyResult.count || 0,
          torDetections: torResult.count || 0,
        },
        systemHealth,
        recentLogs: logsResult.data || [],
      },
    });
  } catch (err) {
    next(err);
  }
}
