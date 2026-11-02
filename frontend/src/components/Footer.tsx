import React from 'react';
import { Shield, ExternalLink, Cpu, Terminal, Network } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-cyber-darkest border-t border-cyber-border mt-20 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Project Identity */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span className="font-bold text-slate-100 tracking-wider font-mono">NETDEFENSE</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Design and Implementation of a VPN and Proxy IP Detection System Using Network and IP Intelligence.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>CORE API ENGINE: OPERATIONAL</span>
            </div>
          </div>

          {/* Column 2: Architecture Highlights */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 uppercase font-mono tracking-wider text-[11px]">
              Forensic Architecture
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
                <Terminal className="w-3 h-3 text-cyan-500" /> IPLogs Detection API
              </li>
              <li className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
                <Network className="w-3 h-3 text-cyan-500" /> Google DoH Reverse DNS
              </li>
              <li className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
                <Cpu className="w-3 h-3 text-cyan-500" /> Bitwise CIDR Subnet Engine
              </li>
              <li className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
                <Shield className="w-3 h-3 text-cyan-500" /> Supabase RLS Security Model
              </li>
            </ul>
          </div>

          {/* Column 3: Academic Standards */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 uppercase font-mono tracking-wider text-[11px]">
              Standards & Compliance
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>RFC 1918 Private Addressing</li>
              <li>RFC 3021 /31 Point-to-Point Links</li>
              <li>RFC 791 Historical IPv4 Classes</li>
              <li>RFC 8484 DNS Queries over HTTPS</li>
              <li>OWASP SSRF & Injection Safeguards</li>
            </ul>
          </div>

          {/* Column 4: Ethical & Legal Disclaimer */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 uppercase font-mono tracking-wider text-[11px]">
              Academic Disclaimer
            </h4>
            <p className="text-[11px] leading-relaxed text-slate-500">
              This system is built strictly for educational demonstration, network administration, and authorized defensive analysis.
              It does not engage in port scanning, probing, or deanonymization. IP intelligence metrics are indicative and cannot guarantee absolute proof.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <div>
            © {new Date().getFullYear()} VPN & Proxy IP Detection System. Built with React, TypeScript & Express.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Academic & Cybersecurity Capstone</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
