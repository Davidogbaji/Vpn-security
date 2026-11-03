# VPN AND PROXY IP DETECTION SYSTEM

> **Project Subtitle:** Design and Implementation of a VPN and Proxy IP Detection System Using Network and IP Intelligence.  
> **Platform:** Professional Network & Threat Intelligence System

---

## 1. Project Overview

The **VPN and Proxy IP Detection System** is a professional, production-minded cybersecurity web application that demonstrates how IP intelligence, BGP network information, reverse DNS, proxy identification, VPN detection, IP classification, and client-side privacy auditing can be synthesized to evaluate internet connections.

### Key Objectives
1. **Detect Anonymous Networks:** Classify public IP addresses as commercial VPNs, open proxies, residential proxy pools, Tor exit nodes, privacy relays, or cloud hosting datacentres.
2. **Retrieve Deep IP Intelligence:** Extract country, region, city, ISP, Autonomous System Number (ASN), ASN organization, network prefix, and reverse DNS.
3. **Execute Reverse DNS Forensics:** Query PTR records using DNS-over-HTTPS (DoH, RFC 8484) via Google Public DNS.
4. **Audit Client Privacy:** Provide safe browser-side WebRTC ICE candidate interrogation, IPv6 dual-stack leak checks, and DNS resolution audits.
5. **Compute CIDR & Subnetting:** Provide full 32-bit bitwise IPv4 subnet calculations with RFC 3021 /31 point-to-point links and /32 single-host routes.
6. **Classify Historical Address Classes:** Analyze traditional Class A, B, C, D, and E architectures and compare them with modern CIDR.
7. **Perform High-Throughput Bulk Scans:** Ingest multi-line IP batches or CSV lists to process telemetry with live distribution charting.
8. **Generate Multi-Format Forensic Reports:** Produce downloadable reports in Adobe PDF, genuine Microsoft Word DOCX, formula-sanitized CSV, and JSON.
9. **Maintain Secure Analyst History:** User accounts with Supabase PostgreSQL Row Level Security (RLS) guaranteeing private investigation records.
10. **Administrator Telemetry Dashboard:** Server-side RBAC monitoring total users, investigations, threat detections, and service health.

---

## 2. Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React icons, Recharts.
- **Backend:** Node.js 24, Express.js, TypeScript, Zod, Helmet, CORS, express-rate-limit.
- **Database & Auth:** Supabase PostgreSQL with Row Level Security (RLS) policies.
- **Intelligence Providers:** IPLogs API (Primary Detection), Google Public DNS-over-HTTPS (Reverse DNS), Public BGP ASN Registries.
- **Reporting Engine:** jsPDF, docx (true binary DOCX), and PapaParse.
- **Testing:** Vitest automated test suite.

---

## 3. Directory Structure

```
vpn-proxy-detection-system/
├── frontend/                        # React + Vite + Tailwind CSS Application
│   ├── src/
│   │   ├── components/              # UI components (Navbar, Footer, RiskScoreMeter, VerdictBadge, etc.)
│   │   ├── pages/                   # Landing, Dashboard, Lookup, Detection, LeakTest, Tools, Bulk, History, Admin, Help
│   │   ├── services/                # API client, WebRTC probe, Supabase client
│   │   ├── context/                 # AuthContext (Supabase Auth & Demo mode)
│   │   ├── types/                   # TypeScript domain definitions
│   │   ├── App.tsx                  # Root application router
│   │   └── main.tsx                 # DOM entrypoint
│   └── package.json
│
├── backend/                         # Express.js + TypeScript REST API
│   ├── src/
│   │   ├── config/                  # Environment variables & constants
│   │   ├── middleware/              # SSRF guard, rate limiter, error handler, auth
│   │   ├── controllers/             # IP, Detection, Network, DNS, Reports, History, Admin
│   │   ├── routes/                  # Modular Express router endpoints
│   │   ├── services/                # IPLogsAdapter, DohService, CidrEngine, IpClassifier, ReportService, SupabaseService
│   │   ├── utils/                   # IP parsing, binary bitwise helpers, logger
│   │   ├── validators/              # Zod validation schemas
│   │   └── server.ts                # App initialization & listen
│   ├── tests/                       # Automated unit tests (Vitest)
│   ├── .env.example
│   └── package.json
│
├── supabase/                        # Database migrations & RLS configuration
│   └── migrations/
│       ├── 001_initial_schema.sql   # Tables, indexes, triggers
│       └── 002_rls_policies.sql    # Zero-trust row level security
│
└── docs/                            # Comprehensive academic & technical documentation
    ├── PROJECT_ARCHITECTURE.md
    ├── DATABASE_SCHEMA.md
    ├── API_DOCUMENTATION.md
    ├── USER_GUIDE.md
    ├── SECURITY_NOTES.md
    └── ACADEMIC_PROJECT_OVERVIEW.md
```

---

## 4. Installation & Setup Instructions

### 4.1. Prerequisites
- **Node.js:** v18.0.0 or higher (v24.x tested)
- **npm:** v9.x or higher

### 4.2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *Note: The application includes real fallback intelligence so it functions immediately even if you haven't entered an IPLogs API key yet.*

4. Run automated tests to verify algorithms:
   ```bash
   npm test
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will run on **http://localhost:5000**. Verify via health check: `http://localhost:5000/api/health`.

### 4.3. Frontend Setup
1. In a second terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to **http://localhost:5173**.

---

## 5. Supabase Database Configuration

The application includes full migrations for Supabase PostgreSQL.

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Run the SQL statements from:
   - `supabase/migrations/001_initial_schema.sql` (Creates tables, triggers, and indexes)
   - `supabase/migrations/002_rls_policies.sql` (Enables Row-Level Security)
4. Retrieve your **Project URL**, **Anon Key**, and **Service Role Key** from Supabase Settings -> API.
5. Add them to `backend/.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
6. Optional: To connect the frontend directly to Supabase, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `frontend/.env`.

*(Note: If you do not have Supabase credentials yet, the application features an automatic local guest/demo mode so you can test all features immediately without setup friction!)*

---

## 6. Security & SSRF Protection

This application adheres to strict defensive security practices:
- **SSRF Guard:** Rejects requests to internal RFC 1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopback (`127.0.0.1`), and cloud metadata (`169.254.169.254`).
- **CSV Formula Injection Sanitization:** Neutralizes cells starting with `=`, `+`, `-`, `@`, `\t`, or `\r` (CWE-1236).
- **Rate Limiting:** Protects against automated abuse and denial of service.
- **Server-Side RBAC:** Admin permissions are strictly validated against the database.
- **Zero Raw SQL:** Parameterized Supabase client queries prevent SQL injection.

---

## 7. Automated Testing Suite

The project includes unit test suites in `backend/tests/`:
- `tests/ipUtils.test.ts`: IPv4/IPv6 validation, SSRF filter, DoH PTR query construction.
- `tests/cidrEngine.test.ts`: Subnet calculations, /31 point-to-point links, /32 single host routes.
- `tests/ipClassifier.test.ts`: Class A, B, C, D, E identification and IPv6 handling.
- `tests/reportService.test.ts`: CSV formula injection sanitization and JSON report generation.

Run tests:
```bash
cd backend
npm test
```

---

## 8. Deployment Guide

### Frontend Deployment (Cloudflare Pages / Vercel)
1. Push your repository to GitHub.
2. In Cloudflare Pages, connect your repository.
3. Configure build settings:
   - **Framework preset:** Vite
   - **Build command:** `cd frontend && npm install && npm run build`
   - **Build output directory:** `frontend/dist`
   - **Environment Variables:** Set `VITE_API_URL` to your production backend URL.

### Backend Deployment (Render / Railway / Cloudflare Workers / VPS)
1. Deploy the `backend/` directory to any Node.js compatible platform (Render, Railway, Fly.io, or VPS).
2. Start command: `node dist/server.js` (after `npm run build`).
3. Set environment variables from `backend/.env.example`.

---

## 9. Academic Notice & Limitations

- **Probabilistic Nature:** IP intelligence indicates the characteristics of network blocks and routing announcements at the timestamp of interrogation. It should not be treated as absolute infallible proof.
- **No Remote De-anonymization:** A web application cannot penetrate an encrypted VPN tunnel to uncover an external visitor's private IP. The server strictly sees the VPN exit node.
- **Geolocation Approximations:** Coordinates map to regional ISP allocation centers and do not identify an exact physical street address.
