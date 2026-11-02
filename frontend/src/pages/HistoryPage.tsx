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
  Lock,
  Database,
  ExternalLink,
  Sparkles,
  HelpCircle,
  X,
  Copy,
  Check,
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
  const [storageEngine, setStorageEngine] = useState<string>('Local JSON Fallback');
  const [isCloudConfigured, setIsCloudConfigured] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedForReport, setSelectedForReport] = useState<any | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    // If user is not yet logged in, auto-activate guest session for zero-friction testing
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
      if ((res as any).storageEngine) {
        setStorageEngine((res as any).storageEngine);
      }
      setIsCloudConfigured(res.configured);
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!user) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-cyber-border text-center space-y-4 max-w-xl mx-auto my-12 animate-fadeIn">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Analyst Session Access</h2>
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          Investigation history stores previous forensic scans.
          You can test it immediately using one-click Guest Access, or connect your free Supabase cloud database.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs font-mono tracking-wider transition-all shadow-glow-cyan"
        >
          Click Here for 1-Click Guest Analyst / Admin Demo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title & Engine Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-cyan-400" />
            <span>Investigation History</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            SAVED SCANS ARCHIVE & FORENSIC LOGS
          </p>
        </div>

        {/* Engine status indicator & guide button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isCloudConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'
              }`}
            />
            <span className="text-slate-400">Database:</span>
            <span className={isCloudConfigured ? 'text-emerald-400 font-bold' : 'text-cyan-400'}>
              {storageEngine}
            </span>
          </div>

          <button
            onClick={() => setShowSetupGuide(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cloud Setup Guide</span>
          </button>
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

      {/* Cloud Setup Modal */}
      {showSetupGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-cyber-card border border-cyber-border rounded-2xl shadow-glass overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-slate-900 to-cyber-dark p-6 border-b border-cyber-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">How to Connect Free Supabase Cloud</h3>
              </div>
              <button
                onClick={() => setShowSetupGuide(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                Good news: Your system is currently using the built-in Local Database engine! You can test, save scans, and export reports without any setup.
              </div>

              <p>If you want to connect cloud PostgreSQL for permanent remote sync, follow these 3 free steps (takes 2 minutes):</p>

              <div className="space-y-3 font-mono">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-cyan-400 font-bold block">Step 1: Create a Free Supabase Project</span>
                  <span className="text-slate-400 font-sans block">
                    Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline">supabase.com</a> (100% Free, no credit card required) and click "New Project".
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-cyan-400 font-bold block">Step 2: Run the Migration SQL</span>
                  <span className="text-slate-400 font-sans block">
                    In your Supabase dashboard, click <strong>SQL Editor</strong> and run the contents of:
                  </span>
                  <div className="text-[11px] text-slate-300 bg-slate-950 p-2 rounded border border-slate-800">
                    supabase/migrations/001_initial_schema.sql<br />
                    supabase/migrations/002_rls_policies.sql
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-cyan-400 font-bold block">Step 3: Paste Keys into backend/.env</span>
                  <span className="text-slate-400 font-sans block">
                    In Supabase, go to <strong>Project Settings &gt; API</strong> and copy your URL &amp; Keys into your <code className="text-cyan-300">backend/.env</code>:
                  </span>
                  <div className="text-[11px] text-slate-300 bg-slate-950 p-2 rounded border border-slate-800">
                    SUPABASE_URL=https://your-project.supabase.co<br />
                    SUPABASE_ANON_KEY=your-anon-key<br />
                    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 text-right">
              <button
                onClick={() => setShowSetupGuide(false)}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-semibold text-xs font-mono"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

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
