# User Guide & Operations Manual

Welcome to the **VPN and Proxy IP Detection System**. This guide provides practical instructions for operating the platform, understanding results, and executing investigations.

---

## 1. Quick Start Workflow

### 1.1. Starting the Application
1. **Start the Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   The backend API will listen on `http://localhost:5000`.

2. **Start the Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   Open `http://localhost:5173` in your web browser.

---

## 2. Navigating the Core Modules

### Module 1: Dashboard (`/dashboard`)
- **Automatic IP Interrogation:** When you load the Dashboard, the system automatically checks your egress public IP.
- **Risk Score Meter:** Displays a threat risk index from 0 to 100 based on detected network signals.
- **Verdict Badge:** Instantly reveals if your IP is residential broadband, a commercial VPN, an open proxy, a Tor exit node, or cloud hosting.

### Module 2: IP Intelligence (`/lookup`)
- Enter any public IPv4 or IPv6 address.
- View geolocation, ISP name, BGP Autonomous System Number (ASN), network routing prefix, and reverse DNS PTR hostname.
- **Academic Note:** Location coordinates are approximate and represent regional network blocks, not an exact physical house or street address.

### Module 3: VPN & Proxy Detection (`/detection`)
- Execute deep threat scans against any IP address.
- Review matching detection signals (e.g., "Hosting provider / Cloud datacentre ASN allocation", "Commercial VPN endpoint detected").
- Read the forensic explanation summarizing why an address received its verdict.

### Module 4: Real IP Exposure & Leak Analysis (`/leak-test`)
- Tests your own current browser session for privacy vulnerabilities.
- **WebRTC Candidate Check:** Determines whether your browser exposes alternate candidate IPs through STUN protocol queries.
- **Dual-Stack IPv6 Test:** Checks whether you have an active IPv6 connection that might bypass an IPv4-only VPN tunnel.
- **DNS Leak Status:** Verifies whether your DNS queries are routed securely through encrypted DNS-over-HTTPS.

### Module 5: Network Tools (`/tools`)
- **CIDR & Subnet Calculator:** Enter any CIDR notation (e.g., `192.168.1.0/24`, `10.0.0.0/16`). Calculates subnet mask, wildcard mask, network address, broadcast address, first usable host, last usable host, and total host count. Correctly handles special cases such as `/31` point-to-point links (RFC 3021) and `/32` single-host routes.
- **IPv4 Address Classification:** Inspects historical Class A, B, C, D, and E architectures, default masks, and address ranges.
- **Reverse DNS (PTR):** Queries Google Public DNS-over-HTTPS to resolve hostnames for any IPv4 or IPv6 address.

### Module 6: Bulk Analysis (`/bulk`)
- Paste up to 50 IP addresses (one per line) or upload a CSV/TXT file.
- View interactive bar charts showing the breakdown of Clean, VPN, Proxy, Tor, and Hosting networks.
- Export all scan results to a sanitized CSV file.

### Module 7: Investigation History (`/history`)
- Save important scans to your personal database history.
- Search by IP, country, or ISP.
- Re-open past scans or generate instant reports.
- Delete records with zero trace.

---

## 3. Generating Reports

You can export forensic investigation reports in four formats:
1. **Adobe PDF (`.pdf`):** Formal academic layout with header branding, intelligence tables, detection signals, and limitations disclaimer.
2. **Microsoft Word (`.docx`):** Real editable document format suitable for thesis annexes and project reports.
3. **CSV Spreadsheet (`.csv`):** Formatted data with spreadsheet formula injection protection.
4. **Structured JSON (`.json`):** Machine-readable payload with full timestamps and provider request IDs.
