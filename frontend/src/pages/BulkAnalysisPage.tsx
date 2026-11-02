import React, { useState } from 'react';
import { api } from '../services/api';
import { BulkAnalysisSummary, BulkAnalysisItemResult } from '../types';
import { VerdictBadge } from '../components/VerdictBadge';
import {
  Layers,
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Radio,
  Search,
  Filter,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export const BulkAnalysisPage: React.FC = () => {
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<BulkAnalysisSummary | null>(null);
  const [results, setResults] = useState<BulkAnalysisItemResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');

  const sampleIps = [
    '8.8.8.8',
    '1.1.1.1',
    '9.9.9.9',
    '208.67.222.222',
    '185.220.101.5',
    '104.16.132.229',
  ];

  const handleProcess = async (ips: string[]) => {
    if (ips.length === 0) {
      setError('Please provide at least one IP address.');
      return;
    }

    if (ips.length > 50) {
      setError('Batch size limit exceeded. The free academic tier supports up to 50 IP addresses per run.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.bulkDetection(ips);
      setSummary(data.summary);
      setResults(data.results);
    } catch (err: any) {
      setError(err.message || 'Bulk analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = textInput
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    handleProcess(lines);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      // Extract IPs from CSV / Text
      const matches = content.match(/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/g) || [];
      const unique = Array.from(new Set(matches));
      setTextInput(unique.join('\n'));
      handleProcess(unique);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setTextInput(sampleIps.join('\n'));
    handleProcess(sampleIps);
  };

  const handleExportCsv = () => {
    if (results.length === 0) return;

    const headers = ['IP', 'Valid', 'Verdict', 'Score', 'Is_VPN', 'Is_Proxy', 'Is_Tor', 'Country', 'ISP'];
    const rows = results.map((r) => [
      r.ip,
      r.valid ? 'YES' : 'NO',
      r.detection?.verdict || r.error || 'N/A',
      r.detection?.detectionScore ?? 0,
      r.detection?.isVpn ? 'YES' : 'NO',
      r.detection?.isProxy ? 'YES' : 'NO',
      r.detection?.isTor ? 'YES' : 'NO',
      `"${r.intelligence?.country || ''}"`,
      `"${r.intelligence?.isp || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-analysis-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filtered results
  const filteredResults = results.filter((r) => {
    const q = filterQuery.toLowerCase();
    return (
      r.ip.toLowerCase().includes(q) ||
      (r.detection?.verdict || '').toLowerCase().includes(q) ||
      (r.intelligence?.country || '').toLowerCase().includes(q) ||
      (r.intelligence?.isp || '').toLowerCase().includes(q)
    );
  });

  const chartData = summary
    ? [
        { name: 'Clean', count: summary.clean, color: '#10b981' },
        { name: 'VPN', count: summary.vpn, color: '#06b6d4' },
        { name: 'Proxy', count: summary.proxy, color: '#f59e0b' },
        { name: 'Tor', count: summary.tor, color: '#ef4444' },
        { name: 'Hosting', count: summary.hosting, color: '#3b82f6' },
        { name: 'Invalid', count: summary.invalid, color: '#64748b' },
      ]
    : [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-cyan-400" />
            <span>Bulk Network & IP Analysis</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            MODULE G: HIGH-THROUGHPUT ANONYMITY SCANNING & DISTRIBUTION TELEMETRY
          </p>
        </div>

        <button
          onClick={handleLoadSample}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
        >
          Load Demonstration Sample
        </button>
      </div>

      {/* Input Options Card */}
      <div className="glass-panel p-6 rounded-2xl border border-cyber-border space-y-4">
        <form onSubmit={handleSubmitText} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-200 font-mono uppercase">
                IP List Input (One IP per line, Max 50)
              </label>
              <label className="cursor-pointer flex items-center gap-1.5 text-xs text-cyan-400 hover:underline font-mono">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload CSV / TXT File</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={5}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="8.8.8.8&#10;1.1.1.1&#10;9.9.9.9&#10;185.220.101.5"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-cyan-400 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">
              Addresses entered:{' '}
              {textInput.split('\n').filter((l) => l.trim().length > 0).length} / 50
            </span>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs font-mono tracking-wider transition-all shadow-glow-cyan disabled:opacity-50"
            >
              {loading ? 'PROCESSING BATCH...' : 'START BULK ANALYSIS'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Summary Metrics & Chart */}
      {summary && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary Pills Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 font-mono text-xs">
              <span className="text-[10px] text-slate-500 uppercase block">Total Interrogated</span>
              <span className="text-xl font-bold text-white">{summary.total}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs">
              <span className="text-[10px] text-emerald-500 uppercase block">Clean</span>
              <span className="text-xl font-bold text-emerald-400">{summary.clean}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 font-mono text-xs">
              <span className="text-[10px] text-cyan-500 uppercase block">VPN Nodes</span>
              <span className="text-xl font-bold text-cyan-400">{summary.vpn}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 font-mono text-xs">
              <span className="text-[10px] text-amber-500 uppercase block">Proxies</span>
              <span className="text-xl font-bold text-amber-400">{summary.proxy}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 font-mono text-xs">
              <span className="text-[10px] text-rose-500 uppercase block">Tor Exits</span>
              <span className="text-xl font-bold text-rose-400">{summary.tor}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 font-mono text-xs">
              <span className="text-[10px] text-blue-500 uppercase block">Datacentre</span>
              <span className="text-xl font-bold text-blue-400">{summary.hosting}</span>
            </div>
          </div>

          {/* Chart Display */}
          <div className="glass-panel p-6 rounded-2xl border border-cyber-border space-y-4">
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Anonymity Category Distribution
            </h3>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Results Table */}
          <div className="glass-panel p-6 rounded-2xl border border-cyber-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter results..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export CSV Results</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">IP Address</th>
                    <th className="p-3">Verdict</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Country / Region</th>
                    <th className="p-3">ISP / Autonomous System</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                  {filteredResults.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50">
                      <td className="p-3 font-bold text-slate-200">
                        {item.ip}
                        {item.error && (
                          <span className="block text-[10px] text-rose-400 font-normal">
                            {item.error}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {item.detection ? (
                          <VerdictBadge verdict={item.detection.verdict} size="sm" />
                        ) : (
                          <span className="text-rose-400">Error / Blocked</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-300">
                        {item.detection ? `${item.detection.detectionScore}/100` : '-'}
                      </td>
                      <td className="p-3 text-slate-400 truncate max-w-[150px]">
                        {item.intelligence?.country || 'N/A'}
                      </td>
                      <td className="p-3 text-slate-400 truncate max-w-[200px]">
                        {item.intelligence?.isp || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
