# Project Architecture

## System Title
**Design and Implementation of a VPN and Proxy IP Detection System Using Network and IP Intelligence**

---

## 1. Architectural Blueprint

The VPN and Proxy IP Detection System is structured as a modular, decoupled client-server web application. The frontend operates as a responsive Single Page Application (SPA), while the backend functions as a secure RESTful API.

```
+-------------------------------------------------------------------------+
|                              USER BROWSER                               |
|   React + TypeScript + Tailwind CSS + Lucide Icons + Recharts           |
|                                                                         |
|   [Client-Side WebRTC Diagnostic Probes]                                |
+------------------------------------+------------------------------------+
                                     |
                          HTTPS REST API Requests
                          (Bearer JWT Auth Header)
                                     |
                                     v
+------------------------------------+------------------------------------+
|                         EXPRESS BACKEND API                             |
|                                                                         |
|   [Security Middleware]                                                 |
|     * Helmet (Security Headers)                                         |
|     * CORS Origin Filtering                                             |
|     * express-rate-limit (Abuse & DoS Protection)                       |
|     * ssrfGuard (RFC 1918 Private & Cloud Metadata Interception)        |
|     * Zod Validation Schemas                                            |
|                                                                         |
|   [Core Intelligence Services]                                          |
|     * DetectionService -> IPLogsAdapter (Primary Provider)              |
|     * DohService -> Google Public DNS-over-HTTPS (PTR Resolver)         |
|     * CidrEngine -> Bitwise 32-bit Subnet Calculator (/31 & /32)        |
|     * IpClassifier -> RFC 791 Historical Class A-E Engine               |
|     * ReportService -> PDF, DOCX, CSV (Formula Sanitized), JSON         |
|     * SupabaseService -> PostgreSQL Persistence & RLS Role Checks       |
+---------------------+-------------------------------+-------------------+
                      |                               |
       DoH JSON Query |               PostgreSQL Wire | Live API Calls
                      v                               v                   v
           +--------------------+         +--------------------+  +---------------+
           | Google Public DoH  |         | Supabase Database  |  |  IPLogs API   |
           |   (dns.google)     |         |   (PostgreSQL)     |  | (iplogs.com)  |
           +--------------------+         +--------------------+  +---------------+
```

---

## 2. Component Layers

### Frontend Layer (`/frontend`)
- **Framework:** React 18, Vite, TypeScript.
- **Styling:** Tailwind CSS with a cybersecurity dark navy & cyan aesthetic, custom glassmorphism panels, and glowing status indicators.
- **Data Visualization:** Recharts for bulk scan distribution charts and custom SVG circular gauges for threat scoring.
- **Client-Side Diagnostics:** WebRTC `RTCPeerConnection` ICE candidate probing to inspect visitor STUN exposure without deanonymizing external users.

### Backend Layer (`/backend`)
- **Runtime:** Node.js 24 with Express.js and TypeScript.
- **Validation:** Zod schemas enforcing strict input sanitization on IPv4, IPv6, and CIDR strings.
- **Detection Adapter Pattern:** The `DetectionProvider` interface abstracts the underlying intelligence provider (`IpLogsAdapter`). Future threat feeds can be added seamlessly without altering controllers.
- **Reverse DNS Resolver:** Utilizes DNS-over-HTTPS (DoH, RFC 8484) via `dns.google` to query PTR records without requiring native operating system UDP/TCP DNS bindings.
- **Subnet Engine:** Performs 32-bit bitwise unsigned arithmetic for network address calculation, usable host enumeration, wildcard masking, and /31 point-to-point link handling.
- **Reporting Engine:** Produces genuine binary Microsoft Word documents (`.docx`), Adobe PDF files (`.pdf`), spreadsheet-safe CSV exports, and structured JSON files.

### Persistence & Access Control Layer (`/supabase`)
- **Database Engine:** Supabase PostgreSQL.
- **Authentication:** Supabase Auth (JWT).
- **Row-Level Security (RLS):** Database policies ensure users have zero access to records belonging to other analysts.
- **Role Verification:** Administrative privileges are verified strictly on the server (`profiles.role = 'admin'`).

---

## 3. Communication Sequences

### Single IP Investigation Sequence
1. The user inputs an IP or leaves the field empty on the frontend.
2. The request hits `POST /api/detection/check`.
3. `ssrfGuard` validates that the IP is publicly routable (blocks RFC 1918 private IPs, loopback `127.0.0.1`, and AWS/GCP metadata `169.254.169.254`).
4. `DetectionService` queries the `IPLogsAdapter`.
5. Simultaneously, `DohService` queries Google DoH for the reverse DNS PTR record.
6. The backend normalizes the threat score, verdict, provider signals, and ISP metadata into a unified JSON schema.
7. If the user is authenticated, the analysis is optionally persisted to `investigations` and `detection_results` tables in Supabase.
8. The frontend renders the unified card with `VerdictBadge`, `RiskScoreMeter`, and signals breakdown.
