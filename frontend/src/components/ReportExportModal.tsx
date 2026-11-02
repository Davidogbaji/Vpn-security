import React, { useState } from 'react';
import { api } from '../services/api';
import { X, FileText, Download, Check, AlertCircle } from 'lucide-react';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  investigationData: any;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  investigationData,
}) => {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [successFormat, setSuccessFormat] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !investigationData) return null;

  const handleDownload = async (format: 'pdf' | 'docx' | 'csv' | 'json') => {
    setError(null);
    setDownloadingFormat(format);
    setSuccessFormat(null);

    try {
      const payload = {
        ip: investigationData.ip || investigationData.detection?.ip,
        ipVersion: investigationData.intelligence?.version || 'IPv4',
        country: investigationData.intelligence?.country,
        city: investigationData.intelligence?.city,
        isp: investigationData.intelligence?.isp,
        asn: investigationData.intelligence?.asn,
        verdict: investigationData.detection?.verdict || 'Clean',
        detectionScore: investigationData.detection?.detectionScore ?? 0,
        isVpn: Boolean(investigationData.detection?.isVpn),
        isProxy: Boolean(investigationData.detection?.isProxy),
        isTor: Boolean(investigationData.detection?.isTor),
        isPrivacyRelay: Boolean(investigationData.detection?.isPrivacyRelay),
        isHosting: Boolean(investigationData.detection?.isHosting),
        vpnProvider: investigationData.detection?.vpnProvider,
        signals: investigationData.detection?.signals || [],
        reverseDns: investigationData.intelligence?.reverseDns || null,
        analyzedAt: investigationData.detection?.analyzedAt || new Date().toISOString(),
        explanation: investigationData.detection?.explanation || '',
      };

      await api.downloadReport(format, payload);
      setSuccessFormat(format);
      setTimeout(() => setSuccessFormat(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to download report');
    } finally {
      setDownloadingFormat(null);
    }
  };

  const formats: {
    id: 'pdf' | 'docx' | 'csv' | 'json';
    name: string;
    desc: string;
    ext: string;
    tag: string;
  }[] = [
    {
      id: 'pdf',
      name: 'Adobe PDF Document',
      desc: 'Forensic PDF layout with intelligence tables, risk badges & academic disclaimer',
      ext: '.pdf',
      tag: 'RECOMMENDED',
    },
    {
      id: 'docx',
      name: 'Microsoft Word Document',
      desc: 'Genuine DOCX format with formatted tables for academic theses and editing',
      ext: '.docx',
      tag: 'EDITABLE',
    },
    {
      id: 'csv',
      name: 'CSV Spreadsheet',
      desc: 'Sanitized tabular data protected against spreadsheet formula injection (CVE-2014-3524)',
      ext: '.csv',
      tag: 'DATA',
    },
    {
      id: 'json',
      name: 'Structured JSON',
      desc: 'Machine-readable JSON schema containing full signals, metadata & request IDs',
      ext: '.json',
      tag: 'API',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-cyber-card border border-cyber-border rounded-2xl shadow-glass overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-cyber-dark p-6 border-b border-cyber-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Export Forensic Report
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Target IP: {investigationData.ip || investigationData.detection?.ip}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="m-6 mb-0 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Format Choices */}
        <div className="p-6 space-y-3">
          {formats.map((fmt) => {
            const isDownloading = downloadingFormat === fmt.id;
            const isSuccess = successFormat === fmt.id;

            return (
              <div
                key={fmt.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all group"
              >
                <div className="space-y-0.5 max-w-[300px]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                      {fmt.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {fmt.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-snug">{fmt.desc}</p>
                </div>

                <button
                  onClick={() => handleDownload(fmt.id)}
                  disabled={isDownloading}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono tracking-wide transition-all ${
                    isSuccess
                      ? 'bg-emerald-500 text-black'
                      : 'bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-black border border-cyan-500/30'
                  }`}
                >
                  {isDownloading ? (
                    <span>Building...</span>
                  ) : isSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Downloaded</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>{fmt.ext}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="p-6 pt-0 text-center">
          <p className="text-[11px] text-slate-500 font-mono">
            All reports include detection timestamps, provider signatures, and academic disclaimers.
          </p>
        </div>
      </div>
    </div>
  );
};
