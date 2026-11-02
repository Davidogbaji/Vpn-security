import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SavedInvestigation } from '../types';
import { VerdictBadge } from '../components/VerdictBadge';
import { ReportExportModal } from '../components/ReportExportModal';
import { useAuth } from '../context/AuthContext';
import {
  History,
  Search,
  Trash2,
  FileDown,
  Filter,
  ShieldCheck,
  Calendar,
  Lock,
  Database,
  ExternalLink,
} from 'lucide-react';

interface HistoryPageProps {
  onOpenAuth: () => void;
  onNavigateToIp: (ip: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onOpenAuth, onNavigateToIp }) => {
  const { user } = useAuth();
  const [investigations, setInvestigations] = useState<SavedInvestigation[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedForReport, setSelectedForReport] = useState<any | null>(null);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user, verdictFilter]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getHistory({
        search: search.trim() || undefined,
        verdict: verdictFilter || undefined,
      });
      setInvestigations(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved investigation?')) return;
    try {
      await api.deleteInvestigation(id);
      setInvestigations(investigations.filter((inv) => inv.id !== id));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleExport = (inv: SavedInvestigation) => {
    const payload = {
      ip: inv.ip_address,
      ipVersion: inv.ip_version,
      country: inv.country,
      city: inv.city,
      isp: inv.isp,
      asn: inv.asn,
      verdict: inv.detection_verdict,
      detectionScore: inv.risk_score,
      isVpn: inv.is_vpn,
      isProxy: inv.is_proxy,
      isTor: inv.is_tor,
      isPrivacyRelay: inv.is_relay,
      isHosting: inv.is_hosting,
      signals: inv.detection_results?.[0]?.raw_signals || [],
      explanation: inv.detection_results?.[0]?.explanation || '',
      analyzedAt: inv.created_at,
    };
    setSelectedForReport(payload);
  };

  if (!user) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-cyber-border text-center space-y-4 max-w-xl mx-auto my-12 animate-fadeIn">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Authentication Required</h2>
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          Investigation history requires a verified security analyst session.
          All historical scans are isolated using Supabase PostgreSQL Row Level Security (RLS) to guarantee complete user privacy.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs font-mono tracking-wider transition-all shadow-glow-cyan"
        >
          Sign In / Quick Demo Access
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-cyan-400" />
            <span>Investigation History</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            MODULE J: ROW-LEVEL SECURED FORENSIC ARCHIVE (SUPABASE RLS)
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-cyber-border flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadHistory()}
            placeholder="Search saved IPs, country, or ISP..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={verdictFilter}
            onChange={(e) => setVerdictFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-400 w-full sm:w-auto"
          >
            <option value="">All Detection Verdicts</option>
            <option value="Clean">Clean</option>
            <option value="VPN detected">VPN Detected</option>
            <option value="Proxy detected">Proxy Detected</option>
            <option value="Tor detected">Tor Detected</option>
            <option value="Hosting network">Hosting / Datacentre</option>
            <option value="Suspicious">Suspicious</option>
          </select>

          <button
            onClick={loadHistory}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
          >
            Filter
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
          {error}
        </div>
      )}

      {/* History Table */}
      <div className="glass-panel rounded-2xl border border-cyber-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-mono">
            Loading investigation records...
          </div>
        ) : investigations.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Database className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-sm font-semibold text-slate-300">No Investigation Records Found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Scans you save from the Dashboard or Detection page will appear in your private database history.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Target IP</th>
                  <th className="p-3.5">Verdict</th>
                  <th className="p-3.5">Score</th>
                  <th className="p-3.5">Country</th>
                  <th className="p-3.5">ISP / ASN</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950/30">
                {investigations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(inv.created_at).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-bold text-slate-200">
                      <button
                        onClick={() => onNavigateToIp(inv.ip_address)}
                        className="hover:text-cyan-400 hover:underline flex items-center gap-1.5"
                      >
                        <span>{inv.ip_address}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </button>
                    </td>
                    <td className="p-3.5">
                      <VerdictBadge verdict={inv.detection_verdict} size="sm" />
                    </td>
                    <td className="p-3.5 text-slate-300">{inv.risk_score} / 100</td>
                    <td className="p-3.5 text-slate-400">{inv.country || 'N/A'}</td>
                    <td className="p-3.5 text-slate-400 truncate max-w-[180px]">
                      {inv.isp || 'N/A'}
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleExport(inv)}
                        title="Download Forensic Report"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(inv.id)}
                        title="Delete Record"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Export Report Modal */}
      {selectedForReport && (
        <ReportExportModal
          isOpen={Boolean(selectedForReport)}
          onClose={() => setSelectedForReport(null)}
          investigationData={selectedForReport}
        />
      )}
    </div>
  );
};
