import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { IpIntelligence, DetectionResult } from '../types';
import { ReportExportModal } from '../components/ReportExportModal';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Globe,
  MapPin,
  Server,
  Network,
  ShieldCheck,
  FileDown,
  BookmarkPlus,
  RefreshCw,
  Info,
  CheckCircle,
} from 'lucide-react';

interface IpLookupPageProps {
  initialIp?: string;
}

export const IpLookupPage: React.FC<IpLookupPageProps> = ({ initialIp = '' }) => {
  const { user } = useAuth();
  const [ipInput, setIpInput] = useState(initialIp);
  const [loading, setLoading] = useState(false);
  const [intelligence, setIntelligence] = useState<IpIntelligence | null>(null);
  const [detection, setDetection] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (initialIp) {
      setIpInput(initialIp);
      performLookup(initialIp);
    } else {
      // Default lookup user's IP
      performLookup();
    }
  }, [initialIp]);

  const performLookup = async (targetIp?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.lookupIp(targetIp || undefined);
      setIntelligence(data.intelligence);
      setDetection(data.detection);
      if (data.ip) setIpInput(data.ip);
    } catch (err: any) {
      setError(err.message || 'IP intelligence lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(ipInput.trim());
  };

  const handleUseMyIp = () => {
    setIpInput('');
    performLookup();
  };

  const handleSave = async () => {
    if (!intelligence || !detection) return;
    try {
      await api.saveInvestigation({ intelligence, detection });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Search className="w-6 h-6 text-cyan-400" />
          <span>IP Intelligence & Network Lookup</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          MODULE A: BGP ROUTING, AUTONOMOUS SYSTEMS & GEOLOCATIONAL RESOLUTION
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
              placeholder="Enter public IPv4 or IPv6 (e.g., 8.8.8.8, 2606:4700:4700::1111)..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs font-mono tracking-wider transition-all shadow-glow-cyan disabled:opacity-50"
          >
            {loading ? 'RESOLVING...' : 'EXECUTE LOOKUP'}
          </button>
          <button
            type="button"
            onClick={handleUseMyIp}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs border border-slate-700 transition-colors"
          >
            Use My IP
          </button>
        </form>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>
            SSRF Guard active: Internal RFC 1918 subnets, cloud metadata (169.254.169.254), and loopback interfaces are blocked.
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Results Display */}
      {intelligence && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Target Host</span>
              <span className="text-xl font-bold font-mono text-cyan-400">{intelligence.ip}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setExportModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
              >
                <FileDown className="w-4 h-4 text-cyan-400" />
                <span>Export Report</span>
              </button>
              {user && (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 text-xs font-mono border border-cyan-800 transition-colors"
                >
                  {savedSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-4 h-4 text-cyan-400" />
                      <span>Save Investigation</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Intelligence Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Identification & Protocol */}
            <div className="glass-panel p-5 rounded-2xl border border-cyber-border space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm border-b border-slate-800 pb-3">
                <Globe className="w-4 h-4" />
                <span>Protocol & Reverse DNS</span>
              </div>
              <div className="space-y-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 uppercase block text-[10px]">Protocol Version</span>
                  <span className="text-slate-200 font-bold">{intelligence.version}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase block text-[10px]">Reverse DNS Hostname (PTR)</span>
                  <span className="text-slate-200 break-all">{intelligence.reverseDns || 'NXDOMAIN (No PTR Record)'}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase block text-[10px]">Network Prefix</span>
                  <span className="text-slate-200">{intelligence.networkPrefix || 'Global Unicast'}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Geolocation & Region */}
            <div className="glass-panel p-5 rounded-2xl border border-cyber-border space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm border-b border-slate-800 pb-3">
                <MapPin className="w-4 h-4" />
                <span>Geographic Location</span>
              </div>
              <div className="space-y-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 uppercase block text-[10px]">Country</span>
                  <span className="text-slate-200 font-bold">
                    {intelligence.country || 'Unknown'} {intelligence.countryCode ? `(${intelligence.countryCode})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase block text-[10px]">Region / State</span>
                  <span className="text-slate-200">{intelligence.region || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase block text-[10px]">City</span>
                  <span className="text-slate-200">{intelligence.city || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase block text-[10px]">Approximate Coordinates</span>
                  <span className="text-slate-200">
                    {intelligence.latitude && intelligence.longitude
                      ? `${intelligence.latitude.toFixed(4)}, ${intelligence.longitude.toFixed(4)}`
                      : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Autonomous System (ASN) & ISP */}
            <div className="glass-panel p-5 rounded-2xl border border-cyber-border space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm border-b border-slate-800 pb-3">
                <Server className="w-4 h-4" />
                <span>Autonomous System & ISP</span>
              </div>
              <div className="space-y-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 uppercase block text-[10px]">Internet Service Provider (ISP)</span>
                  <span className="text-slate-200 break-words">{intelligence.isp || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase block text-[10px]">Organization</span>
                  <span className="text-slate-200 break-words">{intelligence.organization || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase block text-[10px]">BGP Autonomous System (ASN)</span>
                  <span className="text-slate-200">{intelligence.asn || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase block text-[10px]">ASN Organization</span>
                  <span className="text-slate-200 break-words">{intelligence.asnOrg || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Geolocation Accuracy Notice */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-semibold text-slate-200 font-mono uppercase">
                Academic Notice on IP Geolocation Limits
              </h5>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                IP geolocation maps network blocks registered with Regional Internet Registries (RIRs such as ARIN, RIPE, APNIC)
                to approximate city/region centers. It does not provide an exact physical address, GPS coordinate, or building location.
              </p>
            </div>
          </div>
        </div>
      )}

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
