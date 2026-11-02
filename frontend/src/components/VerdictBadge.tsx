import React from 'react';
import { DetectionVerdict } from '../types';
import { ShieldCheck, ShieldAlert, ShieldX, Server, EyeOff, Radio } from 'lucide-react';

interface VerdictBadgeProps {
  verdict: DetectionVerdict | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({ verdict, className = '', size = 'md' }) => {
  const getVerdictConfig = () => {
    switch (verdict) {
      case 'Clean':
        return {
          label: 'Clean / Residential',
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
        };
      case 'VPN detected':
      case 'VPN likely':
        return {
          label: verdict,
          bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
          icon: <Radio className="w-4 h-4 text-cyan-400" />,
        };
      case 'Proxy detected':
        return {
          label: 'Proxy Detected',
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          icon: <ShieldAlert className="w-4 h-4 text-amber-400" />,
        };
      case 'Tor detected':
        return {
          label: 'Tor Exit Node',
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-glow-rose',
          icon: <ShieldX className="w-4 h-4 text-rose-400" />,
        };
      case 'Privacy relay detected':
        return {
          label: 'Privacy Relay',
          bg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
          icon: <EyeOff className="w-4 h-4 text-purple-400" />,
        };
      case 'Hosting network':
        return {
          label: 'Datacentre / Hosting',
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          icon: <Server className="w-4 h-4 text-blue-400" />,
        };
      case 'Suspicious':
        return {
          label: 'Suspicious IP',
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          icon: <ShieldAlert className="w-4 h-4 text-amber-400" />,
        };
      default:
        return {
          label: verdict || 'Inconclusive',
          bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
          icon: <ShieldAlert className="w-4 h-4 text-slate-400" />,
        };
    }
  };

  const config = getVerdictConfig();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2',
    lg: 'text-base px-4 py-1.5 gap-2.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-mono tracking-wide ${config.bg} ${sizeClasses[size]} ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
