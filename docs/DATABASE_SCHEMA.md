# Database Schema Documentation

## Database Platform: Supabase PostgreSQL with Row Level Security (RLS)

This document describes the schema design, tables, relationships, and security policies governing the **VPN and Proxy IP Detection System**.

---

## 1. Entity-Relationship Diagram

```
+-------------------------------------------------------------+
|                      auth.users                             |
|  (Managed securely by Supabase Authentication service)      |
+------------------------------+------------------------------+
                               | 1:1 Cascade
                               v
+-------------------------------------------------------------+
|                      public.profiles                        |
|  - id: UUID (PK, FK -> auth.users.id)                       |
|  - email: TEXT NOT NULL                                     |
|  - full_name: TEXT                                          |
|  - role: TEXT ('user' | 'admin')                            |
|  - created_at: TIMESTAMPTZ                                  |
|  - updated_at: TIMESTAMPTZ                                  |
+--------------------+-------------------+--------------------+
                     |                   |
            1:N      |                   | 1:N
                     v                   v
+--------------------+--------+  +-------+--------------------+
|     public.investigations   |  |   public.report_records    |
|  - id: UUID (PK)            |  |  - id: UUID (PK)           |
|  - user_id: UUID (FK)       |  |  - user_id: UUID (FK)      |
|  - ip_address: TEXT         |  |  - report_format: TEXT     |
|  - ip_version: TEXT         |  |  - file_name: TEXT         |
|  - country, city, isp, asn  |  |  - created_at: TIMESTAMPTZ |
|  - detection_verdict: TEXT  |  +----------------------------+
|  - risk_score: INTEGER      |
|  - is_vpn, is_proxy, is_tor |
|  - is_relay, is_hosting     |
|  - created_at: TIMESTAMPTZ  |
+--------------------+--------+
                     | 1:1
                     v
+--------------------+--------+
|  public.detection_results   |
|  - id: UUID (PK)            |
|  - investigation_id: UUID   |
|  - provider_name: TEXT      |
|  - raw_signals: JSONB       |
|  - network_metadata: JSONB  |
|  - explanation: TEXT        |
|  - analyzed_at: TIMESTAMPTZ |
+-----------------------------+
```

---

## 2. Table Specifications

### 2.1. `profiles`
Extends Supabase's `auth.users` to maintain user identity and RBAC authorization.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, REFERENCES auth.users(id) ON DELETE CASCADE` | Matches the authenticated user ID |
| `email` | `TEXT` | `NOT NULL` | User email address |
| `full_name` | `TEXT` | `NULLABLE` | Display name of the analyst |
| `role` | `TEXT` | `NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))` | Role used for server-side authorization |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Timestamp of profile creation |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Timestamp of last profile update |

### 2.2. `investigations`
Stores saved IP investigation assessments conducted by authenticated users.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique investigation identifier |
| `user_id` | `UUID` | `NOT NULL REFERENCES profiles(id) ON DELETE CASCADE` | Owning analyst |
| `ip_address` | `TEXT` | `NOT NULL` | Evaluated target IP address |
| `ip_version` | `TEXT` | `NOT NULL DEFAULT 'IPv4'` | Protocol version ('IPv4' or 'IPv6') |
| `country` | `TEXT` | `NULLABLE` | Geolocation country name |
| `city` | `TEXT` | `NULLABLE` | Geolocation city |
| `isp` | `TEXT` | `NULLABLE` | Internet Service Provider |
| `asn` | `TEXT` | `NULLABLE` | Autonomous System Number |
| `detection_verdict` | `TEXT` | `NOT NULL` | Assessment verdict (Clean, VPN detected, etc.) |
| `risk_score` | `INTEGER` | `NOT NULL DEFAULT 0` | Threat risk index (0 to 100) |
| `is_vpn` | `BOOLEAN` | `DEFAULT false` | VPN detection flag |
| `is_proxy` | `BOOLEAN` | `DEFAULT false` | Proxy detection flag |
| `is_tor` | `BOOLEAN` | `DEFAULT false` | Tor exit node flag |
| `is_relay` | `BOOLEAN` | `DEFAULT false` | Privacy relay flag |
| `is_hosting` | `BOOLEAN` | `DEFAULT false` | Cloud / datacentre hosting flag |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Investigation execution timestamp |

### 2.3. `detection_results`
Stores detailed provider metadata, raw indicators, and heuristic signals for an investigation.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Result ID |
| `investigation_id` | `UUID` | `NOT NULL REFERENCES investigations(id) ON DELETE CASCADE` | Associated investigation |
| `provider_name` | `TEXT` | `NOT NULL DEFAULT 'IPLogs'` | Intelligence provider name |
| `provider_request_id` | `TEXT` | `NULLABLE` | Upstream provider request identifier |
| `raw_signals` | `JSONB` | `NOT NULL DEFAULT '[]'::jsonb` | Array of technical detection signals |
| `network_metadata` | `JSONB` | `NOT NULL DEFAULT '{}'::jsonb` | Complete BGP & geolocational metadata |
| `explanation` | `TEXT` | `NULLABLE` | Human-readable forensic explanation |
| `analyzed_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Interrogation timestamp |

### 2.4. `report_records`
Audit trail of generated report files (PDF, DOCX, CSV, JSON).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Record ID |
| `user_id` | `UUID` | `NOT NULL REFERENCES profiles(id) ON DELETE CASCADE` | Requesting user |
| `report_format` | `TEXT` | `CHECK (report_format IN ('pdf', 'docx', 'csv', 'json'))` | Document format |
| `file_name` | `TEXT` | `NOT NULL` | Export filename |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Generation timestamp |

### 2.5. `system_audit_logs`
System activity log for tracking security events, bulk analyses, and admin actions.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Log ID |
| `user_id` | `UUID` | `NULLABLE REFERENCES profiles(id) ON DELETE SET NULL` | Performing user (or null if guest) |
| `action` | `TEXT` | `NOT NULL` | Event action name |
| `target_resource` | `TEXT` | `NULLABLE` | Target IP or resource name |
| `ip_address` | `TEXT` | `NULLABLE` | Requester client IP |
| `metadata` | `JSONB` | `DEFAULT '{}'::jsonb` | Context payload |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Event timestamp |

---

## 3. Row-Level Security (RLS) Policies

All tables have Row-Level Security enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).

1. **User Isolation:** Users can only query, insert, or delete records where `auth.uid() = user_id`.
2. **Detection Results Access:** Users can only read `detection_results` associated with investigations they own.
3. **Admin Exemption:** Users possessing the `admin` role in `profiles` can query audit logs and platform-wide metrics.
4. **No Password Storage:** All credential hashing (bcrypt/argon2) and token signing are delegated entirely to Supabase Authentication.
