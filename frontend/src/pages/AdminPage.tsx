import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  ShieldAlert,
  Users,
  Activity,
  Radio,
  Server,
  Cpu,
  Clock,
  Terminal,
  Database,
  RefreshCw,
  AlertOctagon,
} from 'lucide-react';

interface AdminPageProps {
  onOpenAuth: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadOverview();
    }
  }, [user]);

  const loadOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAdminOverview();
      setOverviewData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch administrative telemetry');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-rose-500/30 text-center space-y-4 max-w-xl mx-auto my-12 animate-fadeIn">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Administrative Access Restricted</h2>
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          Access to system logs, platform health diagnostics, and user telemetry is protected by server-side role verification.
          Your current session does not hold the <code className="text-rose-400 font-mono">admin</code> role.
        </p>
        <div className="pt-2">
          <button
            onClick={onOpenAuth}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-colors"
          >
            Switch to Admin Demo Account
          </button>
        </div>
      </div>
    );
  }

  const metrics = overviewData?.metrics || {
    totalUsers: 0,
    totalInvestigations: 0,
    vpnDetections: 0,
    proxyDetections: 0,
    torDetections: 0,
  };

  const health = overviewData?.systemHealth;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Lock className="w-6 h-6 text-cyan-400" />
            <span>Administrator Control Center</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            MODULE K: SERVER-SIDE RBAC TELEMETRY, SERVICE HEALTH & AUDIT TRAIL
          </p>
        </div>

        <button
          onClick={loadOverview}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-cyber-border space-y-1 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase">
            <span>Registered Users</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-bold text-white">{metrics.totalUsers}</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-cyber-border space-y-1 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase">
            <span>Total Analyses</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-bold text-white">{metrics.totalInvestigations}</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-cyan-500/20 space-y-1 font-mono text-xs">
          <div className="flex items-center justify-between text-cyan-500 text-[10px] uppercase">
            <span>VPN Detections</span>
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-bold text-cyan-400">{metrics.vpnDetections}</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-amber-500/20 space-y-1 font-mono text-xs">
          <div className="flex items-center justify-between text-amber-500 text-[10px] uppercase">
            <span>Proxy Relays</span>
            <Server className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold text-amber-400">{metrics.proxyDetections}</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-rose-500/20 space-y-1 font-mono text-xs">
          <div className="flex items-center justify-between text-rose-500 text-[10px] uppercase">
            <span>Tor Exit Nodes</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-bold text-rose-400">{metrics.torDetections}</span>
        </div>
      </div>

      {/* System Health Breakdown */}
      {health && (
        <div className="glass-panel p-6 rounded-2xl border border-cyber-border space-y-4">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Core Daemon & Service Health</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block">Engine Status</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{health.status}</span>
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block">Uptime</span>
              <span className="text-slate-200 font-bold">{Math.floor(health.uptimeSeconds / 60)} minutes</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block">Node.js Runtime</span>
              <span className="text-slate-200 font-bold">{health.nodeVersion}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block">Memory Heap Used</span>
              <span className="text-slate-200 font-bold">{health.memory?.heapUsedMb} MB</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">IPLogs Detection API</span>
              <span className={health.services?.iplogsApi?.configured ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {health.services?.iplogsApi?.configured ? 'KEY CONFIGURED' : 'FALLBACK MODE'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Supabase PostgreSQL</span>
              <span className={health.services?.supabase?.configured ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {health.services?.supabase?.configured ? 'CONNECTED' : 'LOCAL / DEMO'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Google DoH Resolver</span>
              <span className="text-emerald-400 font-bold">OPERATIONAL</span>
            </div>
          </div>
        </div>
      )}

      {/* System Audit Logs */}
      <div className="glass-panel rounded-2xl border border-cyber-border overflow-hidden space-y-4 p-6">
        <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>Security Audit Trail & Telemetry</span>
        </h3>

        {overviewData?.recentLogs?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border border-slate-800 rounded-xl overflow-hidden">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target Resource</th>
                  <th className="p-3">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                {overviewData.recentLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-900/50">
                    <td className="p-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 text-cyan-400 font-bold">{log.action}</td>
                    <td className="p-3 text-slate-200">{log.target_resource || '-'}</td>
                    <td className="p-3 text-slate-500 text-[11px] truncate max-w-[150px]">
                      {log.user_id || 'Anonymous / Guest'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-500 font-mono">
            Audit logs will populate dynamically as users perform lookups, reports, and administrative tasks.
          </div>
        )}
      </div>
    </div>
  );
};
