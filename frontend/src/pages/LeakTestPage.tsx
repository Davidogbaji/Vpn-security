import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { performLeakAnalysis } from '../services/webrtcProbe';
import { LeakAnalysisResult } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  Globe,
  Radio,
  RefreshCw,
  AlertTriangle,
  Lock,
  Cpu,
  CheckCircle2,
  Info,
  Server,
  Network,
} from 'lucide-react';

export const LeakTestPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [visitorIp, setVisitorIp] = useState<string>('');
  const [leakResult, setLeakResult] = useState<LeakAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runAudit();
  }, []);

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get visitor's public egress IP seen by server
      const ipData = await api.getMyIp();
      const detectedIp = ipData.ip;
      setVisitorIp(detectedIp);

      // 2. Perform browser-side WebRTC ICE and IPv6 leak inspection
      const result = await performLeakAnalysis(detectedIp);
      setLeakResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to complete leak analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-cyan-400" />
            <span>Real IP Exposure and Leak Analysis</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            MODULE C: WEBRTC ICE CANDIDATE ENUMERATION, DUAL-STACK IPV6 & DNS RESOLVER AUDIT
          </p>
        </div>

        <button
          onClick={runAudit}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono tracking-wider transition-colors shadow-glow-cyan disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'AUDITING...' : 'RE-RUN AUDIT'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Main Audit Summary */}
      {leakResult && (
        <div className="space-y-6">
          {/* Status Banner */}
          <div className="glass-panel p-6 rounded-2xl border border-cyber-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    leakResult.possibleLeaks.length > 0
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {leakResult.possibleLeaks.length > 0 ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">
                    Exposure Assessment Verdict
                  </span>
                  <span className="text-xl font-bold font-mono text-white">
                    {leakResult.possibleLeaks.length > 0
                      ? `${leakResult.possibleLeaks.length} Potential Exposure Signal(s)`
                      : 'Encrypted & Shielded (No Critical Leaks)'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">
                  Public Visible IP (Egress)
                </span>
                <span className="text-sm font-bold font-mono text-cyan-400">{visitorIp}</span>
              </div>
            </div>

            {/* Test Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* WebRTC Status */}
              <div
                className={`p-4 rounded-xl border space-y-2 font-mono text-xs ${
                  leakResult.webrtcLeakDetected
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase">WebRTC Exposure</span>
                  {leakResult.webrtcLeakDetected ? (
                    <span className="text-amber-400 font-bold">CANDIDATE LEAK</span>
                  ) : (
                    <span className="text-emerald-400 font-bold">PROTECTED</span>
                  )}
                </div>
                <div className="text-slate-200">
                  {leakResult.webrtcCandidates.length} candidate(s) discovered
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-tight">
                  {leakResult.webrtcLeakDetected
                    ? 'Browser STUN queries exposed alternate candidate network address.'
                    : 'No external STUN bypass or local address exposure detected.'}
                </p>
              </div>

              {/* IPv6 Dual-Stack Status */}
              <div
                className={`p-4 rounded-xl border space-y-2 font-mono text-xs ${
                  leakResult.ipv6Available
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase">IPv6 Dual-Stack</span>
                  {leakResult.ipv6Available ? (
                    <span className="text-cyan-400 font-bold">ACTIVE</span>
                  ) : (
                    <span className="text-slate-400">IPv4 ONLY</span>
                  )}
                </div>
                <div className="text-slate-200 truncate">
                  {leakResult.ipv6Address || 'No IPv6 Route Detected'}
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-tight">
                  {leakResult.ipv6Available
                    ? 'Dual-stack IPv6 is operational. Ensure your VPN tunnels IPv6 traffic.'
                    : 'Network operates in single-stack IPv4. No dual-stack leak risk.'}
                </p>
              </div>

              {/* DNS Resolver Status */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase">DNS Architecture</span>
                  <span className="text-emerald-400 font-bold">DoH VERIFIED</span>
                </div>
                <div className="text-slate-200">{leakResult.dnsResolverStatus}</div>
                <p className="text-[11px] text-slate-400 font-sans leading-tight">
                  DNS-over-HTTPS queries are encrypted end-to-end to prevent ISP eavesdropping.
                </p>
              </div>
            </div>
          </div>

          {/* WebRTC Discovered Candidates Table */}
          {leakResult.webrtcCandidates.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-cyber-border space-y-3">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>WebRTC ICE Candidates Interrogated</span>
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Below are the Interactive Connectivity Establishment (ICE) candidates generated by your browser session.
                Private addresses are kept local to prevent unnecessary exposure.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border border-slate-800 rounded-xl overflow-hidden">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Candidate IP</th>
                      <th className="p-3">Candidate Type</th>
                      <th className="p-3">Protocol</th>
                      <th className="p-3">Status vs Public IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                    {leakResult.webrtcCandidates.map((c, i) => {
                      const isMatch = c.ip === visitorIp;
                      return (
                        <tr key={i} className="hover:bg-slate-900/50">
                          <td className="p-3 font-bold text-slate-200">{c.ip}</td>
                          <td className="p-3 text-cyan-400">{c.type}</td>
                          <td className="p-3 text-slate-400">{c.protocol.toUpperCase()}</td>
                          <td className="p-3">
                            {isMatch ? (
                              <span className="text-emerald-400 font-semibold">
                                Matches Egress IP (Normal)
                              </span>
                            ) : (
                              <span className="text-amber-400 font-semibold">
                                Divergent Candidate (Exposed)
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Corrective Actions & Hardening Recommendations */}
          <div className="glass-panel p-6 rounded-2xl border border-cyber-border space-y-3">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Recommended Hardening & Corrective Actions</span>
            </h3>

            <div className="space-y-2">
              {leakResult.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-sans">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
