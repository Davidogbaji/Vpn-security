import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // IPLogs API configuration (VPN & Proxy detection provider)
  // Official docs: https://iplogs.com/docs
  iplogs: {
    apiUrl: process.env.IPLOGS_API_URL || 'https://iplogs.com/v1/check',
    apiKey: process.env.IPLOGS_API_KEY || '',
    timeoutMs: parseInt(process.env.IPLOGS_TIMEOUT_MS || '6000', 10),
  },

  // DNS-over-HTTPS (DoH) Google resolver
  doh: {
    googleDnsUrl: 'https://dns.google/resolve',
    timeoutMs: 5000,
  },

  // Supabase Configuration
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    bulkMaxIps: parseInt(process.env.BULK_MAX_IPS || '25', 10), // Limit for free tier batch check
  },
};
