import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'local_history.json');

export interface LocalInvestigation {
  id: string;
  user_id: string;
  ip_address: string;
  ip_version: string;
  country?: string;
  city?: string;
  isp?: string;
  asn?: string;
  detection_verdict: string;
  risk_score: number;
  is_vpn: boolean;
  is_proxy: boolean;
  is_tor: boolean;
  is_relay: boolean;
  is_hosting: boolean;
  created_at: string;
  detection_results?: {
    provider_name: string;
    raw_signals: string[];
    network_metadata: any;
    explanation: string;
  }[];
}

interface LocalDbSchema {
  investigations: LocalInvestigation[];
  audit_logs: any[];
}

function ensureDbFile(): LocalDbSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: LocalDbSchema = {
      investigations: [
        {
          id: 'demo-inv-001',
          user_id: 'demo-analyst-id',
          ip_address: '8.8.8.8',
          ip_version: 'IPv4',
          country: 'United States',
          city: 'Mountain View',
          isp: 'Google LLC',
          asn: 'AS15169',
          detection_verdict: 'Hosting network',
          risk_score: 40,
          is_vpn: false,
          is_proxy: false,
          is_tor: false,
          is_relay: false,
          is_hosting: true,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          detection_results: [
            {
              provider_name: 'IPLogs',
              raw_signals: ['Hosting provider / Cloud datacentre ASN allocation'],
              network_metadata: { reverseDns: 'dns.google' },
              explanation: 'Identified as Google Cloud Public DNS network infrastructure.',
            },
          ],
        },
      ],
      audit_logs: [
        {
          id: 'log-001',
          user_id: 'demo-analyst-id',
          action: 'SYSTEM_INITIALIZED',
          target_resource: 'Local Storage Engine',
          created_at: new Date().toISOString(),
        },
      ],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { investigations: [], audit_logs: [] };
  }
}

function saveDb(data: LocalDbSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save local DB:', err);
  }
}

export const localDb = {
  getInvestigations: (userId: string, search?: string, verdict?: string): LocalInvestigation[] => {
    const db = ensureDbFile();
    let list = db.investigations.filter((inv) => inv.user_id === userId || userId === 'all' || inv.user_id.startsWith('demo-') || inv.user_id.startsWith('guest-'));

    if (verdict) {
      list = list.filter((inv) => inv.detection_verdict.toLowerCase() === verdict.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (inv) =>
          inv.ip_address.toLowerCase().includes(q) ||
          (inv.country || '').toLowerCase().includes(q) ||
          (inv.isp || '').toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  saveInvestigation: (userId: string, intelligence: any, detection: any): LocalInvestigation => {
    const db = ensureDbFile();
    const newInv: LocalInvestigation = {
      id: `inv-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      user_id: userId,
      ip_address: detection.ip,
      ip_version: intelligence?.version || 'IPv4',
      country: intelligence?.country,
      city: intelligence?.city,
      isp: intelligence?.isp,
      asn: intelligence?.asn,
      detection_verdict: detection.verdict,
      risk_score: detection.detectionScore || 0,
      is_vpn: Boolean(detection.isVpn),
      is_proxy: Boolean(detection.isProxy),
      is_tor: Boolean(detection.isTor),
      is_relay: Boolean(detection.isPrivacyRelay),
      is_hosting: Boolean(detection.isHosting),
      created_at: new Date().toISOString(),
      detection_results: [
        {
          provider_name: detection.provider || 'IPLogs',
          raw_signals: detection.signals || [],
          network_metadata: intelligence || {},
          explanation: detection.explanation || '',
        },
      ],
    };

    db.investigations.unshift(newInv);
    saveDb(db);
    return newInv;
  },

  deleteInvestigation: (id: string, userId: string): boolean => {
    const db = ensureDbFile();
    const initialLen = db.investigations.length;
    db.investigations = db.investigations.filter((inv) => inv.id !== id);
    if (db.investigations.length !== initialLen) {
      saveDb(db);
      return true;
    }
    return false;
  },

  getStats: () => {
    const db = ensureDbFile();
    const total = db.investigations.length;
    const vpn = db.investigations.filter((i) => i.is_vpn).length;
    const proxy = db.investigations.filter((i) => i.is_proxy).length;
    const tor = db.investigations.filter((i) => i.is_tor).length;
    return {
      totalInvestigations: total,
      vpnDetections: vpn,
      proxyDetections: proxy,
      torDetections: tor,
      recentLogs: db.audit_logs || [],
    };
  },
};
