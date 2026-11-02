import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { IpIntelligence, DetectionResult } from '../types';
import { VerdictBadge } from '../components/VerdictBadge';
import { RiskScoreMeter } from '../components/RiskScoreMeter';
import { ReportExportModal } from '../components/ReportExportModal';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Search,
  Globe,
  Radio,
  ShieldAlert,
  Server,
  Layers,
  FileDown,
  BookmarkPlus,
  RefreshCw,
  ExternalLink,
  Cpu,
  CheckCircle,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  onSearchIp: (ip: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onSearchIp }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [targetIpInput, setTargetIpInput] = useState('');
  const [visitorIp, setVisitorIp] = useState<string>('');
  const [intelligence, setIntelligence] = useState<IpIntelligence | null>(null);
  const [detection, setDetection] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchMyIp();
  }, []);

  const fetchMyIp = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMyIp();
      setVisitorIp(data.ip);
      setIntelligence(data.intelligence);
      setDetection(data.detection);
    } catch (err: any) {
      setError(err.message || 'Failed to detect public IP address');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetIpInput.trim()) return;
    onSearchIp(targetIpInput.trim());
    onNavigate('detection');
  };

  const handleSaveInvestigation = async () => {
    if (!detection || !intelligence) return;
    try {
      await api.saveInvestigation({ intelligence, detection });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Could not save investigation: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            <span>Operations Dashboard</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            REAL-TIME THREAT RADAR & NETWORK SURVEILLANCE
          </p>
        </div>

        {/* Global IP Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={targetIpInput}
              onChange={(e) => setTargetIpInput(e.target.value)}
              placeholder="Query any public IPv4 or IPv6..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono tracking-wider transition-colors shadow-glow-cyan"
          >
            INSPECT
          </button>
        </form>
      </div>

      {/* Visitor Current Public IP Assessment Card */}
      <div className="glass-panel rounded-2xl p-6 border border-cyber-border space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                Visitor Egress Connection
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold text-white font-mono">
                  {loading ? 'Interrogating network...' : visitorIp || 'Unavailable'}
                </span>
                {detection && <VerdictBadge verdict={detection.verdict} size="sm" />}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMyIp}
              disabled={loading}
              title="Refresh Assessment"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setExportModalOpen(true)}
              disabled={!detection}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors disabled:opacity-50"
            >
              <FileDown className="w-4 h-4 text-cyan-400" />
              <span>Export</span>
            </button>
            {user && (
              <button
                onClick={handleSaveInvestigation}
                disabled={!detection}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 text-xs font-mono border border-cyan-800 transition-colors disabled:opacity-50"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4 text-cyan-400" />
                    <span>Save to History</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
            {error}
          </div>
        )}

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          {/* Risk Score Gauge */}
          <div className="md:col-span-1 flex justify-center p-4 bg-slate-900/60 rounded-xl border border-slate-800">
            {detection ? (
              <RiskScoreMeter score={detection.detectionScore} />
            ) : (
              <div className="h-28 flex items-center justify-center text-xs text-slate-500">
                Awaiting Scan
              </div>
            )}
          </div>

          {/* Network Intelligence Breakdown */}
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Reverse DNS (PTR)</span>
              <span className="text-xs font-mono text-slate-200 truncate block">
                {intelligence?.reverseDns || 'None (NXDOMAIN)'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Location (Approx.)</span>
              <span className="text-xs font-mono text-slate-200 truncate block">
                {intelligence?.city ? `${intelligence.city}, ` : ''}{intelligence?.country || 'Unknown'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">ISP Provider</span>
              <span className="text-xs font-mono text-slate-200 truncate block">
                {intelligence?.isp || 'Unknown'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Autonomous System</span>
              <span className="text-xs font-mono text-slate-200 truncate block">
                {intelligence?.asn || 'N/A'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Anonymity Signals</span>
              <span className="text-xs font-mono text-slate-200 truncate block">
                {detection ? `${detection.signals.length} Signal(s) Found` : 'None'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Intelligence Provider</span>
              <span className="text-xs font-mono text-cyan-400 truncate block">
                {detection?.provider || 'IPLogs'}
              </span>
            </div>
          </div>
        </div>

        {/* Technical Signals Banner */}
        {detection && detection.signals.length > 0 && (
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
              Forensic Rationale & Matching Indicators:
            </span>
            <div className="flex flex-wrap gap-2">
              {detection.signals.map((sig, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700"
                >
                  • {sig}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-400 pt-1 leading-relaxed">
              {detection.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Module Shortcuts Grid */}
      <div>
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Active Investigation Suites</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigate('lookup')}
            className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer space-y-2 group"
          >
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">IP Intelligence</h4>
            <p className="text-xs text-slate-400">
              Deep lookup of BGP ASN, ISP routing prefixes, and reverse DNS PTR.
            </p>
          </div>

          <div
            onClick={() => onNavigate('detection')}
            className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer space-y-2 group"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Radio className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">VPN / Proxy Detection</h4>
            <p className="text-xs text-slate-400">
              Identify residential proxies, commercial VPNs, and Tor exit nodes.
            </p>
          </div>

          <div
            onClick={() => onNavigate('leak-test')}
            className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer space-y-2 group"
          >
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">Real IP Leak Test</h4>
            <p className="text-xs text-slate-400">
              Browser WebRTC candidate discovery, DNS leaks, and IPv6 exposure auditing.
            </p>
          </div>

          <div
            onClick={() => onNavigate('tools')}
            className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer space-y-2 group"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Server className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-white">Subnet & Classes</h4>
            <p className="text-xs text-slate-400">
              Bitwise CIDR calculator, /31 point-to-point subnets, and IPv4 Class A-E analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Export Report Modal */}
      {intelligence && detection && (
        <ReportExportModal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          investigationData={{ intelligence, detection }}
        />
      )}
    </div>
  );
};
