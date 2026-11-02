import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Radio,
  Layers,
  FileText,
  Activity,
  ArrowRight,
  CheckCircle2,
  Lock,
  Globe,
  Terminal,
  Server,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
  onSearchIp: (ip: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSearchIp }) => {
  const [quickIp, setQuickIp] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickIp.trim()) {
      onSearchIp(quickIp.trim());
      onNavigate('detection');
    } else {
      onNavigate('dashboard');
    }
  };

  const capabilities = [
    {
      icon: Radio,
      title: 'VPN & Proxy Detection',
      desc: 'Identify commercial VPN nodes, datacenter proxies, residential pools, Tor exit nodes, and privacy relays via IPLogs API intelligence.',
    },
    {
      icon: Search,
      title: 'Deep IP Intelligence',
      desc: 'Retrieve geolocation, autonomous system numbers (ASN), ISP infrastructure, organization profiles, and network routing prefixes.',
    },
    {
      icon: ShieldAlert,
      title: 'Real IP & Leak Analysis',
      desc: 'Safely audit visitor exposure through browser WebRTC ICE candidate probes, DNS resolution tests, and dual-stack IPv6 leak detection.',
    },
    {
      icon: Terminal,
      title: 'DoH Reverse DNS',
      desc: 'Perform authenticated PTR record resolution via Google Public DNS-over-HTTPS (RFC 8484) with in-addr.arpa and ip6.arpa query building.',
    },
    {
      icon: Server,
      title: 'CIDR & Class Subnetting',
      desc: 'Compute complete 32-bit subnet masks, wildcard masks, usable host counts, /31 point-to-point links, and historical IPv4 Class A-E analysis.',
    },
    {
      icon: Layers,
      title: 'Bulk Network Scans',
      desc: 'Ingest multi-line IP batches or CSV lists to process high-volume network telemetry with live distribution charting and rate limiting.',
    },
  ];

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 sm:pt-20 sm:pb-16 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/80 text-cyan-400 text-xs font-mono tracking-wide">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>ACADEMIC CYBERSECURITY CAPSTONE PROJECT</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            VPN and Proxy <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
              IP Detection System
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-sans max-w-2xl mx-auto leading-relaxed">
            Design and Implementation of a VPN and Proxy IP Detection System Using Network and IP Intelligence.
            Assess anonymous routing, reverse DNS, BGP Autonomous Systems, and browser leaks.
          </p>

          {/* Quick IP Search Bar */}
          <form onSubmit={handleQuickSubmit} className="max-w-xl mx-auto pt-4">
            <div className="relative flex items-center shadow-glass rounded-xl bg-slate-900/90 border border-cyan-500/30 p-1.5 focus-within:border-cyan-400 transition-all">
              <Search className="w-5 h-5 text-cyan-400 ml-3" />
              <input
                type="text"
                value={quickIp}
                onChange={(e) => setQuickIp(e.target.value)}
                placeholder="Enter IPv4 or IPv6 (e.g., 8.8.8.8, 1.1.1.1, or leave empty for your IP)"
                className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
              />
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs tracking-wider font-mono transition-all shadow-glow-cyan"
              >
                <span>ANALYZE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-400 font-mono">
              <span>Quick tests:</span>
              <button
                type="button"
                onClick={() => {
                  setQuickIp('8.8.8.8');
                  onSearchIp('8.8.8.8');
                  onNavigate('detection');
                }}
                className="text-cyan-400 hover:underline"
              >
                8.8.8.8 (Google)
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuickIp('1.1.1.1');
                  onSearchIp('1.1.1.1');
                  onNavigate('detection');
                }}
                className="text-cyan-400 hover:underline"
              >
                1.1.1.1 (Cloudflare)
              </button>
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="text-cyan-400 hover:underline"
              >
                My Current IP
              </button>
            </div>
          </form>

          {/* Quick Action Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm border border-slate-700 transition-colors"
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Launch Operations Dashboard</span>
            </button>
            <button
              onClick={() => onNavigate('leak-test')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 font-medium text-sm border border-cyan-800 transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>Run Browser Leak Test</span>
            </button>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Integrated Network Intelligence Modules
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto font-sans">
            Comprehensive suite of cybersecurity tools designed for academic demonstration and defensive analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div
                key={i}
                className="glass-panel glass-panel-hover p-6 rounded-2xl relative overflow-hidden group space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white tracking-wide">{cap.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">{cap.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Security Architecture & Methodology Overview */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 rounded-3xl border border-cyber-border space-y-6">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-bold text-white">
              Forensic Methodology & Multi-Layer Evaluation
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The system applies a defense-in-depth inspection model to evaluate target IP addresses.
            Rather than relying exclusively on a single indicator, the detection service correlates BGP Autonomous System (ASN) classifications,
            reverse DNS pointer records (PTR) resolved through DNS-over-HTTPS, and the IPLogs threat intelligence provider.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-cyan-400 font-mono text-xs font-semibold">LAYER 1: INTELLIGENCE</span>
              <p className="text-xs text-slate-400">
                IPLogs API integration parsing VPN, proxy, Tor, and datacenter provider flags.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-blue-400 font-mono text-xs font-semibold">LAYER 2: DNS FORENSICS</span>
              <p className="text-xs text-slate-400">
                Google Public DoH resolver executing PTR queries against in-addr.arpa and ip6.arpa.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-purple-400 font-mono text-xs font-semibold">LAYER 3: CLIENT PRIVACY</span>
              <p className="text-xs text-slate-400">
                WebRTC ICE candidate enumeration and dual-stack IPv6 exposure auditing.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
