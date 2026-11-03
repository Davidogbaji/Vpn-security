import React, { useState } from 'react';
import { api } from '../services/api';
import {
  CidrCalculationResult,
  IpClassificationResult,
  ReverseDnsResult,
} from '../types';
import {
  Calculator,
  Server,
  Network,
  Search,
  Binary,
  Layers,
  Info,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const NetworkToolsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cidr' | 'class' | 'dns'>('cidr');

  // CIDR Calculator State
  const [cidrInput, setCidrInput] = useState('192.168.1.10/24');
  const [cidrResult, setCidrResult] = useState<CidrCalculationResult | null>(null);
  const [cidrLoading, setCidrLoading] = useState(false);
  const [cidrError, setCidrError] = useState<string | null>(null);

  // Classify State
  const [classifyInput, setClassifyInput] = useState('172.16.50.1');
  const [classifyResult, setClassifyResult] = useState<IpClassificationResult | null>(null);
  const [classifyLoading, setClassifyLoading] = useState(false);
  const [classifyError, setClassifyError] = useState<string | null>(null);

  // Reverse DNS State
  const [dnsInput, setDnsInput] = useState('8.8.8.8');
  const [dnsResult, setDnsResult] = useState<ReverseDnsResult | null>(null);
  const [dnsLoading, setDnsLoading] = useState(false);
  const [dnsError, setDnsError] = useState<string | null>(null);

  const handleCidrCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCidrLoading(true);
    setCidrError(null);
    try {
      const data = await api.calculateCidr(cidrInput.trim());
      setCidrResult(data);
    } catch (err: any) {
      setCidrError(err.message || 'Failed to calculate CIDR');
    } finally {
      setCidrLoading(false);
    }
  };

  const handleClassify = async (e: React.FormEvent) => {
    e.preventDefault();
    setClassifyLoading(true);
    setClassifyError(null);
    try {
      const data = await api.classifyIp(classifyInput.trim());
      setClassifyResult(data);
    } catch (err: any) {
      setClassifyError(err.message || 'Failed to classify IP address');
    } finally {
      setClassifyLoading(false);
    }
  };

  const handleReverseDns = async (e: React.FormEvent) => {
    e.preventDefault();
    setDnsLoading(true);
    setDnsError(null);
    try {
      const data = await api.reverseDns(dnsInput.trim());
      setDnsResult(data);
    } catch (err: any) {
      setDnsError(err.message || 'Reverse DNS lookup failed');
    } finally {
      setDnsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calculator className="w-6 h-6 text-cyan-400" />
          <span>Network Diagnostic & Forensic Calculators</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          MODULES D, E & F: BITWISE SUBNETTING, CLASSFUL ADDRESSING & DOH REVERSE DNS
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cyber-border space-x-2">
        <button
          onClick={() => setActiveTab('cidr')}
          className={`flex items-center gap-2 px-5 py-3 font-mono text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'cidr'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Binary className="w-4 h-4" />
          <span>CIDR & Subnet Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('class')}
          className={`flex items-center gap-2 px-5 py-3 font-mono text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'class'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>IPv4 Class Hierarchy</span>
        </button>

        <button
          onClick={() => setActiveTab('dns')}
          className={`flex items-center gap-2 px-5 py-3 font-mono text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'dns'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>DoH Reverse DNS (PTR)</span>
        </button>
      </div>

      {/* TAB 1: CIDR CALCULATOR */}
      {activeTab === 'cidr' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-cyber-border space-y-4">
            <h3 className="text-base font-bold text-white font-mono">IPv4 CIDR & Subnet Calculator</h3>
            <p className="text-xs text-slate-400 font-sans">
              Enter any IPv4 address with prefix notation (0 to 32). Computes network boundary, broadcast ID,
              and usable hosts with support for /31 point-to-point links (RFC 3021) and /32 single-host routes.
            </p>

            <form onSubmit={handleCidrCalculate} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={cidrInput}
                onChange={(e) => setCidrInput(e.target.value)}
                placeholder="192.168.1.0/24 or 10.0.0.1/16"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={cidrLoading}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono tracking-wider transition-colors shadow-glow-cyan disabled:opacity-50"
              >
                {cidrLoading ? 'CALCULATING...' : 'COMPUTE SUBNET'}
              </button>
            </form>
          </div>

          {cidrError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              {cidrError}
            </div>
          )}

          {cidrResult && (
            <div className="glass-panel p-6 rounded-2xl border border-cyber-border space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Subnet Range</span>
                  <span className="text-2xl font-bold font-mono text-cyan-400">{cidrResult.input}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Usable Host Count</span>
                  <span className="text-xl font-bold font-mono text-white">
                    {cidrResult.usableHostCount.toLocaleString()} Hosts
                  </span>
                </div>
              </div>

              {/* Edge Case Alert */}
              {cidrResult.specialNote && (
                <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800 text-xs text-cyan-300 font-mono flex items-center gap-2">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span>{cidrResult.specialNote}</span>
                </div>
              )}

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Subnet Mask</span>
                  <span className="text-slate-200 font-bold">{cidrResult.subnetMask}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Wildcard Mask</span>
                  <span className="text-slate-200 font-bold">{cidrResult.wildcardMask}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Network Address (ID)</span>
                  <span className="text-cyan-400 font-bold">{cidrResult.networkAddress}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Broadcast Address</span>
                  <span className="text-rose-400 font-bold">{cidrResult.broadcastAddress}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">First Usable Host</span>
                  <span className="text-emerald-400 font-bold">{cidrResult.firstUsableHost}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Last Usable Host</span>
                  <span className="text-emerald-400 font-bold">{cidrResult.lastUsableHost}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Total IP Space</span>
                  <span className="text-slate-200 font-bold">{cidrResult.totalAddresses.toLocaleString()}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">CIDR Prefix</span>
                  <span className="text-slate-200 font-bold">/{cidrResult.cidrPrefix}</span>
                </div>
              </div>

              {/* Binary Mask */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block">
                  32-Bit Binary Subnet Mask Representation:
                </span>
                <div className="text-xs sm:text-sm font-mono text-slate-200 tracking-widest break-all">
                  {cidrResult.binarySubnet}
                </div>
                <p className="text-[11px] text-slate-500 font-sans pt-1">
                  Bits set to '1' define the immutable network address portion; bits set to '0' designate the host allocation pool.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: IP CLASSIFICATION */}
      {activeTab === 'class' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-cyber-border space-y-4">
            <h3 className="text-base font-bold text-white font-mono">Traditional IPv4 Address Class Identifier</h3>
            <p className="text-xs text-slate-400 font-sans">
              Analyzes historical Class A, B, C, D, and E architectures (RFC 791). Demonstrates how leading octet bits
              partition network IDs and host IDs prior to CIDR supernetting.
            </p>

            <form onSubmit={handleClassify} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={classifyInput}
                onChange={(e) => setClassifyInput(e.target.value)}
                placeholder="Enter IP (e.g., 10.0.0.1, 172.16.1.1, 192.168.1.1, 224.0.0.1)..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={classifyLoading}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono tracking-wider transition-colors shadow-glow-cyan disabled:opacity-50"
              >
                {classifyLoading ? 'CLASSIFYING...' : 'CLASSIFY IP'}
              </button>
            </form>
          </div>

          {classifyError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              {classifyError}
            </div>
          )}

          {classifyResult && (
            <div className="glass-panel p-6 rounded-2xl border border-cyber-border space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Target IP</span>
                  <span className="text-2xl font-bold font-mono text-cyan-400">{classifyResult.ip}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-sm">
                    {classifyResult.addressClass}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-sm">
                    {classifyResult.scope}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Default Subnet Mask</span>
                  <span className="text-slate-200 font-bold">{classifyResult.defaultSubnetMask || 'N/A'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Historical Address Range</span>
                  <span className="text-slate-200 font-bold">{classifyResult.addressRange || 'N/A'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Network Portion</span>
                  <span className="text-cyan-400 font-bold">{classifyResult.networkPortion || 'N/A'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Host Portion</span>
                  <span className="text-emerald-400 font-bold">{classifyResult.hostPortion || 'N/A'}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block">
                  Historical Context & Specifications:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {classifyResult.explanation}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: REVERSE DNS */}
      {activeTab === 'dns' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-cyber-border space-y-4">
            <h3 className="text-base font-bold text-white font-mono">DNS-over-HTTPS (DoH) Reverse DNS Resolver</h3>
            <p className="text-xs text-slate-400 font-sans">
              Queries authoritative pointer records (PTR) using Google Public DNS (RFC 8484).
              Constructs reverse arpa domains automatically for both IPv4 and IPv6 addresses.
            </p>

            <form onSubmit={handleReverseDns} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={dnsInput}
                onChange={(e) => setDnsInput(e.target.value)}
                placeholder="Enter public IPv4 or IPv6 (e.g. 8.8.8.8, 1.1.1.1)..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={dnsLoading}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono tracking-wider transition-colors shadow-glow-cyan disabled:opacity-50"
              >
                {dnsLoading ? 'RESOLVING...' : 'EXECUTE PTR QUERY'}
              </button>
            </form>
          </div>

          {dnsError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              {dnsError}
            </div>
          )}

          {dnsResult && (
            <div className="glass-panel p-6 rounded-2xl border border-cyber-border space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Target Host</span>
                  <span className="text-2xl font-bold font-mono text-cyan-400">{dnsResult.ip}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">DNS Status</span>
                  <span className="text-sm font-bold font-mono text-slate-200">{dnsResult.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">PTR Resolved Hostname</span>
                  <span className="text-emerald-400 font-bold break-all">
                    {dnsResult.ptr || 'NXDOMAIN (None Configured)'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Resolver Service</span>
                  <span className="text-slate-200 font-bold truncate block">{dnsResult.resolver}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block">Response Latency</span>
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{dnsResult.responseTimeMs} ms</span>
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block">
                  Forensic Interpretation:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {dnsResult.note}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
