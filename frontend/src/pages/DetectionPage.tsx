import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DetectionResult, IpIntelligence } from '../types';
import { VerdictBadge } from '../components/VerdictBadge';
import { RiskScoreMeter } from '../components/RiskScoreMeter';
import { ReportExportModal } from '../components/ReportExportModal';
import { useAuth } from '../context/AuthContext';
import {
  Radio,
  Search,
  ShieldCheck,
  ShieldAlert,
  Server,
  EyeOff,
  Clock,
  Fingerprint,
  FileDown,
  BookmarkPlus,
  AlertTriangle,
  Info,
  CheckCircle,
} from 'lucide-react';

interface DetectionPageProps {
  initialIp?: string;
}

export const DetectionPage: React.FC<DetectionPageProps> = ({ initialIp = '' }) => {
  const { user } = useAuth();
  const [ipInput, setIpInput] = useState(initialIp);
  const [loading, setLoading] = useState(false);
  const [detection, setDetection] = useState<DetectionResult | null>(null);
  const [intelligence, setIntelligence] = useState<IpIntelligence | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (initialIp) {
      setIpInput(initialIp);
      performCheck(initialIp);
    } else {
      performCheck();
    }
  }, [initialIp]);

  const performCheck = async (targetIp?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.checkDetection(targetIp || undefined);
      setDetection(data.detection);
      setIntelligence(data.intelligence);
      if (data.detection?.ip) setIpInput(data.detection.ip);
    } catch (err: any) {
      setError(err.message || 'Detection analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performCheck(ipInput.trim());
  };

  const handleSave = async () => {
    if (!detection || !intelligence) return;
    try {
      await api.saveInvestigation({ intelligence, detection });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Radio className="w-6 h-6 text-cyan-400" />
          <span>VPN & Proxy Anonymity Detection</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          MODULE B: HEURISTIC THREAT SCORING, TUNNEL FINGERPRINTING & IPLOGS INTEGRATION
        </p>
      </div>

      {/* Query Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-cyber-border space-y-4">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="Enter public IP (or leave empty to check your caller egress IP)..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs font-mono tracking-wider transition-all shadow-glow-cyan disabled:opacity-50"
          >
            {loading ? 'INTERROGATING...' : 'DETECT VPN / PROXY'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIpInput('');
              performCheck();
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs border border-slate-700 transition-colors"
          >
            Check Caller IP
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Results Section */}
      {detection && (
        <div className="space-y-6">
          {/* Main Verdict Card */}
          <div className="glass-panel p-6 rounded-2xl border border-cyber-border space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Target Evaluation</span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-2xl font-bold font-mono text-white">{detection.ip}</span>
                  <VerdictBadge verdict={detection.verdict} size="md" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExportModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
                >
                  <FileDown className="w-4 h-4 text-cyan-400" />
                  <span>Download Report</span>
                </button>
                {user && (
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 text-xs font-mono border border-cyan-800 transition-colors"
                  >
                    {savedSuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-4 h-4 text-cyan-400" />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Score & Category Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              {/* Score Meter */}
              <div className="flex justify-center p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                <RiskScoreMeter score={detection.detectionScore} />
              </div>

              {/* Status Matrix */}
              <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* VPN Status */}
                <div className={`p-3 rounded-lg border font-mono text-xs ${detection.isVpn ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-900/60 border-slate-800'}`}>
                  <span className="text-[10px] text-slate-500 uppercase block">VPN Status</span>
                  <span className={detection.isVpn ? 'text-cyan-400 font-bold' : 'text-slate-300'}>
                    {detection.isVpn ? 'DETECTED' : 'Not Detected'}
                  </span>
                  {detection.vpnProvider && (
                    <span className="text-[10px] text-cyan-300 block truncate">({detection.vpnProvider})</span>
                  )}
                </div>

                {/* Proxy Status */}
                <div className={`p-3 rounded-lg border font-mono text-xs ${detection.isProxy ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-900/60 border-slate-800'}`}>
                  <span className="text-[10px] text-slate-500 uppercase block">Proxy Server</span>
                  <span className={detection.isProxy ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                    {detection.isProxy ? 'DETECTED' : 'Not Detected'}
                  </span>
                </div>

                {/* Tor Exit Node */}
                <div className={`p-3 rounded-lg border font-mono text-xs ${detection.isTor ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-900/60 border-slate-800'}`}>
                  <span className="text-[10px] text-slate-500 uppercase block">Tor Exit Node</span>
                  <span className={detection.isTor ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                    {detection.isTor ? 'ACTIVE TOR EXIT' : 'Clean'}
                  </span>
                </div>

                {/* Privacy Relay */}
                <div className={`p-3 rounded-lg border font-mono text-xs ${detection.isPrivacyRelay ? 'bg-purple-500/10 border-purple-500/30' : 'bg-slate-900/60 border-slate-800'}`}>
                  <span className="text-[10px] text-slate-500 uppercase block">Privacy Relay</span>
                  <span className={detection.isPrivacyRelay ? 'text-purple-400 font-bold' : 'text-slate-300'}>
                    {detection.isPrivacyRelay ? 'DETECTED' : 'None'}
                  </span>
                </div>

                {/* Hosting Network */}
                <div className={`p-3 rounded-lg border font-mono text-xs ${detection.isHosting ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-900/60 border-slate-800'}`}>
                  <span className="text-[10px] text-slate-500 uppercase block">Datacentre / Hosting</span>
                  <span className={detection.isHosting ? 'text-blue-400 font-bold' : 'text-slate-300'}>
                    {detection.isHosting ? 'CLOUD INFRASTRUCTURE' : 'Residential ISP'}
                  </span>
                </div>

                {/* Reputation */}
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 font-mono text-xs">
                  <span className="text-[10px] text-slate-500 uppercase block">IP Reputation</span>
                  <span className="text-slate-200 font-bold">{detection.reputation}</span>
                </div>
              </div>
            </div>

            {/* Explanation & Signals */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div>
                <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block">
                  Forensic Explanation:
                </span>
                <p className="text-xs text-slate-300 pt-1 leading-relaxed">
                  {detection.explanation}
                </p>
              </div>

              {detection.signals.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1.5">
                    Matching Detection Signals:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {detection.signals.map((sig, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200"
                      >
                        • {sig}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Provider Metadata Footer */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 font-mono">
                <span className="flex items-center gap-1.5">
                  <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
                  Provider: {detection.provider} {detection.providerRequestId ? `(${detection.providerRequestId})` : ''}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Analyzed: {new Date(detection.analyzedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Academic False Positive Disclaimer Notice */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-semibold text-slate-200 font-mono uppercase">
                Academic Methodological Notice: Probabilistic Nature of IP Classification
              </h5>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                A single intelligence provider or ASN classifier can produce false positives or outdated classifications due to dynamic IP reassignment,
                residential VPN routing pools, and corporate remote work gateways. Results are indicative indicators and should be evaluated in context
                with additional forensic telemetry.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Export Report Modal */}
      {detection && (
        <ReportExportModal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          investigationData={{ intelligence, detection }}
        />
      )}
    </div>
  );
};
