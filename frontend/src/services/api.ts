import {
  IpIntelligence,
  DetectionResult,
  ReverseDnsResult,
  CidrCalculationResult,
  IpClassificationResult,
  BulkAnalysisItemResult,
  BulkAnalysisSummary,
  SavedInvestigation,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Standard fetch wrapper with auth header injection and structured error handling
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('vpn_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.error) {
        errorMsg = errJson.error;
      }
    } catch {
      // Non-JSON error body
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // IP Intelligence
  getMyIp: async (): Promise<{
    ip: string;
    isLocalDevelopmentIp: boolean;
    intelligence: IpIntelligence;
    detection: DetectionResult;
  }> => {
    const res: any = await request('/ip/my-ip');
    return res.data;
  },

  lookupIp: async (ip?: string): Promise<{
    ip: string;
    intelligence: IpIntelligence;
    detection: DetectionResult;
  }> => {
    const res: any = await request('/ip/lookup', {
      method: 'POST',
      body: JSON.stringify({ ip }),
    });
    return res.data;
  },

  // Detection
  checkDetection: async (ip?: string): Promise<{
    detection: DetectionResult;
    intelligence: IpIntelligence;
  }> => {
    const res: any = await request('/detection/check', {
      method: 'POST',
      body: JSON.stringify({ ip }),
    });
    return res.data;
  },

  bulkDetection: async (ips: string[]): Promise<{
    summary: BulkAnalysisSummary;
    results: BulkAnalysisItemResult[];
  }> => {
    const res: any = await request('/detection/bulk', {
      method: 'POST',
      body: JSON.stringify({ ips }),
    });
    return res.data;
  },

  // Reverse DNS
  reverseDns: async (ip: string): Promise<ReverseDnsResult> => {
    const res: any = await request('/dns/reverse', {
      method: 'POST',
      body: JSON.stringify({ ip }),
    });
    return res.data;
  },

  // Subnet & Class Calculator
  calculateCidr: async (cidr: string): Promise<CidrCalculationResult> => {
    const res: any = await request('/network/cidr', {
      method: 'POST',
      body: JSON.stringify({ cidr }),
    });
    return res.data;
  },

  classifyIp: async (ip: string): Promise<IpClassificationResult> => {
    const res: any = await request('/network/classify', {
      method: 'POST',
      body: JSON.stringify({ ip }),
    });
    return res.data;
  },

  // Reports
  downloadReport: async (
    format: 'pdf' | 'docx' | 'csv' | 'json',
    investigation: any
  ): Promise<void> => {
    const token = localStorage.getItem('vpn_auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/reports/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ format, investigation }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to generate report');
    }

    if (format === 'json') {
      const jsonData = await response.json();
      const blob = new Blob([JSON.stringify(jsonData.data, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${investigation.ip}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forensic-report-${investigation.ip}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  // Investigation History
  getHistory: async (params: { search?: string; verdict?: string } = {}): Promise<{
    configured: boolean;
    data: SavedInvestigation[];
    total?: number;
  }> => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.verdict) query.set('verdict', params.verdict);
    const res: any = await request(`/history?${query.toString()}`);
    return res;
  },

  saveInvestigation: async (payload: { intelligence: any; detection: any }) => {
    const res: any = await request('/history/save', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res;
  },

  deleteInvestigation: async (id: string) => {
    const res: any = await request(`/history/${id}`, {
      method: 'DELETE',
    });
    return res;
  },

  // Administration
  getAdminOverview: async () => {
    const res: any = await request('/admin/overview');
    return res.data;
  },
};
