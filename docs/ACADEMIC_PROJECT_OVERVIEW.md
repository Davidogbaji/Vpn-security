# Academic Project Overview & Theoretical Framework

## Project Title
**Design and Implementation of a VPN and Proxy IP Detection System Using Network and IP Intelligence**

---

## 1. Abstract

Anonymizing overlay networks—including Virtual Private Networks (VPNs), web proxies, and onion routing networks (Tor)—are widely utilized by legitimate users seeking privacy, but are also frequently leveraged by adversarial actors to conceal abusive traffic, bypass geographical access restrictions, and conduct credential-stuffing attacks.

This project designs and implements an integrated, high-precision web-based IP intelligence and detection platform. By combining Border Gateway Protocol (BGP) Autonomous System (ASN) classification, reverse DNS (PTR) interrogation via DNS-over-HTTPS (DoH), threat intelligence signals from the IPLogs detection provider, and client-side WebRTC ICE exposure auditing, the system produces actionable threat risk scoring while maintaining strict ethical boundaries and defense-in-depth protections against SSRF and injection attacks.

---

## 2. Research Questions & Objectives

1. **How can disparate network indicators be synthesized into a standardized threat score?**
   - The platform designs a composite scoring engine that evaluates ASN infrastructure (residential vs. cloud datacenter), active proxy signatures, and Tor exit node consensus lists.

2. **What are the inherent boundaries of passive IP intelligence?**
   - Explores the probabilistic nature of IP categorization, dynamic residential IP reallocation, and the technical reasons why a remote web application cannot de-anonymize a properly configured VPN client.

3. **How can bitwise network operations (CIDR and historical IPv4 classes) be modeled for educational and forensic utility?**
   - Implements full 32-bit unsigned bitwise manipulation to compute subnet masks, wildcard masks, usable host spaces, RFC 3021 /31 point-to-point subnets, and RFC 791 Class A-E partitions.

---

## 3. Methodological Comparison

| Assessment Dimension | Traditional Geolocation Lookups | Advanced VPN & Proxy IP Detection System |
|---|---|---|
| **Primary Data Source** | Static MaxMind/Whois database dumps | Live BGP ASN tables, IPLogs API, and DoH PTR queries |
| **Detection Scope** | Geolocation only (City, Country) | Geolocation + VPN + Proxy + Tor + Datacenter + Privacy Relays |
| **Reverse DNS** | Local OS UDP query (unencrypted) | Encrypted DNS-over-HTTPS (RFC 8484) via Google Public DNS |
| **Subnet Analysis** | Rarely included | Full 32-bit CIDR engine supporting /31 and /32 edge cases |
| **Client Privacy Auditing** | Absent | Active WebRTC ICE candidate discovery & IPv6 dual-stack audits |
| **Export Formats** | Raw JSON or plaintext | Forensic PDF, genuine Microsoft Word DOCX, CSV, and JSON |
| **Security Controls** | Often vulnerable to SSRF | Native SSRF guard blocking RFC 1918 and cloud metadata |

---

## 4. Key Academic Takeaways

- **The Myth of "De-anonymization":** A web server only receives packets transmitted by the VPN's public egress interface. Unless the visitor's client leaks unencrypted packets (e.g. through WebRTC STUN or DNS leakage), the origin IP remains inaccessible to the destination server.
- **Why Fallback Mechanisms are Critical:** Relying on a single third-party intelligence provider introduces single-point-of-failure vulnerabilities. The system’s adapter pattern ensures continuous operation through DoH heuristics and secondary feeds if the primary provider becomes unreachable.
- **The Transition from Classful to Classless Routing:** Modern internet routing exclusively uses CIDR (RFC 1519), yet understanding historical Class A, B, and C boundaries remains essential for network certification, routing table analysis, and enterprise subnet design.
