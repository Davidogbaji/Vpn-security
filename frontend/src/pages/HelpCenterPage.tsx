import React, { useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  Shield,
  Radio,
  Server,
  Network,
  Binary,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface FaqItem {
  question: string;
  category: string;
  answer: string;
}

export const HelpCenterPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const topics: FaqItem[] = [
    {
      category: 'Fundamentals',
      question: 'What is an IP address (IPv4 vs. IPv6)?',
      answer:
        'An Internet Protocol (IP) address is a numerical label assigned to every device connected to a computer network that uses the Internet Protocol for communication. IPv4 addresses are 32 bits long, written as four decimal octets separated by dots (e.g., 192.168.1.1), providing approximately 4.3 billion possible addresses. IPv6 addresses are 128 bits long, written in hexadecimal notation separated by colons (e.g., 2001:0db8::1), designed to overcome IPv4 exhaustion and provide virtually limitless addressing space.',
    },
    {
      category: 'Anonymity',
      question: 'What is a Virtual Private Network (VPN) and how does it work?',
      answer:
        'A VPN creates an encrypted tunnel between your device and a remote server operated by a VPN service provider (using protocols such as WireGuard, OpenVPN, or IKEv2). All internet traffic from your device passes through this tunnel. Websites see the public IP address of the VPN exit server rather than your residential ISP IP. This obscures your geographical location and protects unencrypted traffic from local Wi-Fi sniffers or ISP surveillance.',
    },
    {
      category: 'Anonymity',
      question: 'What is a Proxy server, and how do Residential vs. Datacenter proxies differ?',
      answer:
        'A proxy server acts as an intermediary for requests from clients seeking resources from other servers. Datacenter proxies are hosted in cloud server farms (e.g., AWS, DigitalOcean); they are fast and cheap but easily detected because their ASN belongs to a hosting provider. Residential proxies route traffic through physical consumer home devices (often through mobile SDK agreements or botnets); they appear as genuine broadband subscribers, making them much harder to detect and highly valued for scraping and credential stuffing.',
    },
    {
      category: 'Anonymity',
      question: 'What is a Tor Exit Node and Onion Routing?',
      answer:
        'The Onion Router (Tor) is a decentralized anonymity network that routes web traffic through three randomly selected volunteer relays (Guard, Middle, and Exit). Each relay strips off one layer of encryption (like an onion). The final relay, known as the Exit Node, decrypts the request and forwards it to the destination website. Because Tor exit node IP addresses are publicly published in directory authority consensus lists, detection systems can identify them with near 100% precision.',
    },
    {
      category: 'Networking',
      question: 'What is an Autonomous System Number (ASN) and BGP?',
      answer:
        'The global Internet is composed of thousands of independently managed networks called Autonomous Systems (AS). Each AS (such as Google, Comcast, or Vodafone) is identified by a unique 16-bit or 32-bit Autonomous System Number (ASN). Networks exchange routing reachability information using the Border Gateway Protocol (BGP). Identifying an IP’s ASN reveals whether the address belongs to a residential broadband provider, a cellular carrier, or a commercial hosting datacentre.',
    },
    {
      category: 'Networking',
      question: 'What is Reverse DNS (PTR Record) and why does a missing PTR matter?',
      answer:
        'Reverse DNS maps an IP address back to its registered domain name using a DNS Pointer (PTR) record stored in the special `in-addr.arpa` (for IPv4) or `ip6.arpa` (for IPv6) zones. Mail servers and security scanners inspect PTR records to verify authenticity. However, having NO PTR record (NXDOMAIN) does NOT automatically imply malicious activity—many consumer broadband ISPs simply do not configure PTR records for dynamic home pools.',
    },
    {
      category: 'Subnetting',
      question: 'What is CIDR and Subnet Masking?',
      answer:
        'Classless Inter-Domain Routing (CIDR, RFC 1519) replaced traditional Class A, B, and C addressing in 1993. It uses a prefix length (e.g., /24) to indicate how many of the 32 bits belong to the network identifier. A bitwise AND operation between the IP address and the subnet mask isolates the immutable network address from the host addresses available for assignment.',
    },
    {
      category: 'Privacy Leaks',
      question: 'What is a WebRTC Leak and why does it occur?',
      answer:
        'WebRTC (Web Real-Time Communication) is an HTML5 technology that enables direct peer-to-peer audio, video, and data communication between browsers. To establish peer connections behind firewalls, WebRTC uses STUN (Session Traversal Utilities for NAT) servers to discover your device’s Interactive Connectivity Establishment (ICE) candidates. Some browsers execute STUN requests outside the VPN or proxy tunnel, inadvertently revealing your real local or public residential IP to the remote web application.',
    },
    {
      category: 'Privacy Leaks',
      question: 'What is a DNS Leak?',
      answer:
        'A DNS leak occurs when your computer sends Domain Name System (DNS) translation queries to your local ISP’s unencrypted resolver instead of routing them through your VPN provider’s private encrypted tunnel. Even if your web traffic is encrypted, an ISP or eavesdropper monitoring your DNS requests can see every single website hostname you visit.',
    },
    {
      category: 'Forensics',
      question: 'What are the technical limitations of VPN detection?',
      answer:
        'No VPN detection system is 100% infallible. Limitations include: (1) Residential Proxies: Because they rotate across authentic consumer devices, their ASN is genuinely residential. (2) Dynamic IP Reallocation: ISPs frequently reallocate IP blocks, leading to temporary false positives. (3) Corporate VPN Gateways: Remote corporate VPNs often look like standard enterprise networks. Therefore, detection scores should be viewed as probabilistic risk indices rather than conclusive evidence.',
    },
  ];

  const categories = ['All', 'Fundamentals', 'Anonymity', 'Networking', 'Subnetting', 'Privacy Leaks', 'Forensics'];

  const filteredTopics = selectedCategory === 'All'
    ? topics
    : topics.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          <span>Educational & Forensic Help Centre</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          MODULE L: NETWORK INTELLIGENCE GLOSSARY & DETECTION METHODOLOGY
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              selectedCategory === cat
                ? 'bg-cyan-500 text-black font-semibold shadow-glow-cyan'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        {filteredTopics.map((topic, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="glass-panel rounded-2xl border border-cyber-border overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800">
                    {topic.category}
                  </span>
                  <span className="text-sm font-semibold text-white tracking-wide">
                    {topic.question}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed font-sans border-t border-slate-800/60 animate-fadeIn">
                  {topic.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Standards & RFC References */}
      <div className="glass-panel p-6 rounded-2xl border border-cyber-border space-y-3">
        <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>Relevant RFC Standards & Engineering Specifications</span>
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-400">
          <li className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span>RFC 1918: Address Allocation for Private Internets</span>
            <span className="text-cyan-400 text-[10px]">IETF</span>
          </li>
          <li className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span>RFC 3021: Using 31-Bit Prefixes on IPv4 Links</span>
            <span className="text-cyan-400 text-[10px]">IETF</span>
          </li>
          <li className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span>RFC 8484: DNS Queries over HTTPS (DoH)</span>
            <span className="text-cyan-400 text-[10px]">IETF</span>
          </li>
          <li className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span>RFC 791: Internet Protocol Specification</span>
            <span className="text-cyan-400 text-[10px]">DARPA</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
