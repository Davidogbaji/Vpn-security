# REST API Documentation

The **VPN and Proxy IP Detection System** backend exposes a structured JSON REST API.

**Base URL:** `http://localhost:5000/api`

---

## 1. System Endpoints

### 1.1. Health Check
`GET /api/health`

Verifies that the backend daemon is operational.

**Response (200 OK):**
```json
{
  "status": "HEALTHY",
  "system": "VPN and Proxy IP Detection System API",
  "uptime": 124,
  "timestamp": "2026-11-02T05:37:06.588Z",
  "version": "1.0.0",
  "mode": "development"
}
```

---

## 2. IP Intelligence Endpoints

### 2.1. Get Caller IP & Assessment
`GET /api/ip/my-ip`

Extracts the caller's public egress IP address and returns its intelligence and anonymity metrics.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "ip": "203.0.113.195",
    "isLocalDevelopmentIp": false,
    "intelligence": {
      "ip": "203.0.113.195",
      "version": "IPv4",
      "country": "United States",
      "city": "Dallas",
      "isp": "Spectrum Broadband",
      "asn": "AS11427"
    },
    "detection": {
      "ip": "203.0.113.195",
      "verdict": "Clean",
      "detectionScore": 0,
      "isVpn": false,
      "isProxy": false,
      "isTor": false
    }
  }
}
```

### 2.2. Lookup Target IP Intelligence
`POST /api/ip/lookup`

Performs deep BGP, ASN, and geolocational intelligence on a specified public IP address. Protected by SSRF guards.

**Request Body:**
```json
{
  "ip": "8.8.8.8"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "ip": "8.8.8.8",
    "intelligence": {
      "ip": "8.8.8.8",
      "version": "IPv4",
      "country": "United States",
      "city": "Mountain View",
      "isp": "Google LLC",
      "asn": "AS15169",
      "reverseDns": "dns.google",
      "isApproximateLocation": true
    },
    "detection": {
      "ip": "8.8.8.8",
      "verdict": "Hosting network",
      "detectionScore": 0,
      "isHosting": true,
      "provider": "IPLogs"
    }
  }
}
```

---

## 3. Anonymity & Detection Endpoints

### 3.1. VPN & Proxy Detection Check
`POST /api/detection/check`

Queries IPLogs API to detect VPN, proxy, residential proxy, Tor exit, or cloud hosting signatures.

**Request Body:**
```json
{
  "ip": "185.220.101.5"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "detection": {
      "ip": "185.220.101.5",
      "verdict": "Tor detected",
      "detectionScore": 95,
      "isVpn": false,
      "isProxy": true,
      "isTor": true,
      "isHosting": true,
      "reputation": "Dangerous",
      "signals": [
        "Active Tor exit node directory match",
        "Proxy server / traffic relay signature identified"
      ],
      "explanation": "This address is identified as an active Tor network exit node.",
      "provider": "IPLogs",
      "providerRequestId": "req_tor_0091",
      "analyzedAt": "2026-11-02T05:38:00.000Z"
    }
  }
}
```

### 3.2. Bulk IP Analysis
`POST /api/detection/bulk`

Batch scans up to 50 IP addresses with rate-limit protection.

**Request Body:**
```json
{
  "ips": ["8.8.8.8", "1.1.1.1", "185.220.101.5"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total": 3,
      "processed": 3,
      "clean": 0,
      "vpn": 0,
      "proxy": 0,
      "tor": 1,
      "hosting": 2,
      "suspicious": 0,
      "invalid": 0,
      "durationMs": 1420
    },
    "results": [...]
  }
}
```

---

## 4. Network Forensics Endpoints

### 4.1. DoH Reverse DNS (PTR)
`POST /api/dns/reverse`

Queries PTR records via Google Public DNS-over-HTTPS.

**Request Body:**
```json
{
  "ip": "1.1.1.1"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "ip": "1.1.1.1",
    "ptr": "one.one.one.one",
    "status": "NOERROR (Success)",
    "statusCode": 0,
    "resolver": "Google Public DNS-over-HTTPS (dns.google)",
    "responseTimeMs": 145,
    "note": "Successfully resolved PTR record: one.one.one.one"
  }
}
```

### 4.2. CIDR & Subnet Calculator
`POST /api/network/cidr`

**Request Body:**
```json
{
  "cidr": "192.168.1.10/24"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "input": "192.168.1.10/24",
    "ip": "192.168.1.10",
    "cidrPrefix": 24,
    "subnetMask": "255.255.255.0",
    "wildcardMask": "0.0.0.255",
    "networkAddress": "192.168.1.0",
    "broadcastAddress": "192.168.1.255",
    "firstUsableHost": "192.168.1.1",
    "lastUsableHost": "192.168.1.254",
    "totalAddresses": 256,
    "usableHostCount": 254,
    "binarySubnet": "11111111.11111111.11111111.00000000",
    "isSpecialSubnet": false
  }
}
```

### 4.3. IPv4 Class Classification
`POST /api/network/classify`

**Request Body:**
```json
{
  "ip": "172.16.50.1"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "ip": "172.16.50.1",
    "version": "IPv4",
    "addressClass": "Class B",
    "defaultSubnetMask": "255.255.0.0 (/16)",
    "addressRange": "128.0.0.0 – 191.255.255.255",
    "networkPortion": "172.16.0.0",
    "hostPortion": "0.0.50.1",
    "scope": "Private",
    "explanation": "Class B addresses use leading binary bits 10..."
  }
}
```

---

## 5. Report Generation Endpoint

`POST /api/reports/generate`

Generates downloadable artifacts in `pdf`, `docx`, `csv`, or `json` formats.

**Request Body:**
```json
{
  "format": "pdf",
  "investigation": {
    "ip": "8.8.8.8",
    "verdict": "Hosting network",
    "detectionScore": 40,
    "isHosting": true
  }
}
```

**Response (200 OK):**
Returns a binary streaming buffer with `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="..."`.

---

## 6. History & Administration Endpoints

- `GET /api/history` (Protected: Requires Bearer JWT)
- `POST /api/history/save` (Protected: Requires Bearer JWT)
- `DELETE /api/history/:id` (Protected: Requires Bearer JWT)
- `GET /api/admin/overview` (Protected: Requires Bearer JWT with `role: admin`)
