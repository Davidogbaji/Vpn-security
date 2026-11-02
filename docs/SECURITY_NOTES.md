# Security Architecture & Defensive Controls

This document details the defensive engineering measures, input sanitization routines, SSRF guards, and zero-trust security controls implemented in the **VPN and Proxy IP Detection System**.

---

## 1. Threat Model & Mitigations

| Vulnerability Threat | Mitigation in System | Implementation File |
|---|---|---|
| **Server-Side Request Forgery (SSRF)** | Strict IP filtering blocking RFC 1918 private subnets, loopback interfaces (`127.0.0.1`), and cloud metadata (`169.254.169.254`). | `backend/src/middleware/ssrfGuard.ts` |
| **API Abuse & Denial of Service (DoS)** | Staged rate limiting on all public routes (100 req/15 min) and stricter limits on bulk scanning (10 batches/15 min). | `backend/src/middleware/rateLimiter.ts` |
| **Spreadsheet Formula Injection (CWE-1236)** | CSV export values starting with dangerous formula characters (`=`, `+`, `-`, `@`, `\t`, `\r`) are sanitized by prepending a single quote (`'`). | `backend/src/services/reportService.ts` |
| **SQL Injection & Data Tampering** | PostgreSQL queries are executed through parameterized Supabase client calls. Zero raw string SQL concatenation. | `backend/src/services/supabaseService.ts` |
| **Privilege Escalation** | Admin routes verify user roles strictly via server-side database lookups (`profiles.role = 'admin'`). Frontend claims are never trusted. | `backend/src/middleware/auth.ts` |
| **Cross-Site Scripting (XSS)** | React JSX escapes all output values by default. HTTP security headers (`Helmet`) enforce CSP, HSTS, and frame protection. | `backend/src/server.ts` |
| **Credential & Key Exposure** | Secret API keys (`IPLOGS_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) exist solely on the backend. Frontend code receives only sanitized responses. | `backend/src/config/index.ts` |

---

## 2. Server-Side Request Forgery (SSRF) Guard

The `ssrfGuard` middleware intercepts all target IP inputs before any external network socket or HTTP request is initiated.

```
Target IP Input
      |
      v
+-----------------------------+
| Is it a valid IP address?   |----[NO]----> Return 400 Bad Request
+-----------------------------+
      | [YES]
      v
+-----------------------------+
| Is it RFC 1918 Private?     |----[YES]---> Return 403 Forbidden (SSRF Blocked)
| 10.0.0.0/8                  |
| 172.16.0.0/12               |
| 192.168.0.0/16              |
+-----------------------------+
      | [NO]
      v
+-----------------------------+
| Is it Loopback or Link-Local?|---[YES]---> Return 403 Forbidden (SSRF Blocked)
| 127.0.0.0/8 (Localhost)     |
| 169.254.0.0/16 (Metadata)   |
| ::1 (IPv6 Loopback)         |
+-----------------------------+
      | [NO]
      v
Proceed to Outbound Intelligence Providers (IPLogs / DoH)
```

Educational subnetting calculators (`/api/network/cidr` and `/api/network/classify`) are exempt from SSRF blocking because they perform pure in-memory bitwise mathematics and never make external HTTP network calls.

---

## 3. CSV Formula Injection Sanitization (CWE-1236)

Spreadsheet applications (such as Microsoft Excel and Google Sheets) automatically execute commands when a cell begins with `=cmd|...` or `@SUM(...)`.

The `sanitizeCsvValue` routine checks all exported cells:
```typescript
export function sanitizeCsvValue(val: any): string {
  if (val === null || val === undefined) return '""';
  let str = String(val).replace(/"/g, '""');

  if (/^[=\+\-@\t\r]/.test(str)) {
    str = `'${str}`; // Prepend single quote to neutralize formula execution
  }

  return `"${str}"`;
}
```

---

## 4. Ethical & Lawful Network Analysis

This application is strictly designed for **passive, lawful IP intelligence and defensive analysis**.
- It does **not** perform active port scanning (e.g. Nmap SYN scans).
- It does **not** brute-force authentication.
- It does **not** probe remote private networks.
- It does **not** exploit WebRTC to de-anonymize external visitors.
- It operates strictly using public BGP tables, authoritative DNS-over-HTTPS queries, and documented IP intelligence APIs.
