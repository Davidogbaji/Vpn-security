import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType } from 'docx';

export interface ReportInvestigationData {
  ip: string;
  ipVersion?: string;
  country?: string;
  city?: string;
  isp?: string;
  asn?: string;
  verdict: string;
  detectionScore?: number;
  isVpn?: boolean;
  isProxy?: boolean;
  isTor?: boolean;
  isPrivacyRelay?: boolean;
  isHosting?: boolean;
  vpnProvider?: string;
  signals?: string[];
  reverseDns?: string | null;
  analyzedAt?: string;
  explanation?: string;
}

/**
 * Sanitizes strings for CSV export to protect against CSV formula injection (CVE-2014-3524 / CWE-1236)
 */
export function sanitizeCsvValue(val: any): string {
  if (val === null || val === undefined) return '""';
  let str = String(val).replace(/"/g, '""');

  // If the cell begins with dangerous spreadsheet formula triggers, prepend a single quote
  if (/^[=\+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  return `"${str}"`;
}

export class ReportService {
  /**
   * Generates a high-quality forensic PDF report
   */
  static async generatePdf(data: ReportInvestigationData, reportId: string): Promise<Buffer> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor = [15, 23, 42]; // Dark Navy
    const accentColor = [6, 182, 212]; // Cyan
    const alertColor = data.verdict === 'Clean' ? [16, 185, 129] : [239, 68, 68];

    // Header Background
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 36, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('VPN AND PROXY IP DETECTION SYSTEM', 14, 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('FORENSIC NETWORK INTELLIGENCE & SECURITY ASSESSMENT REPORT', 14, 23);
    doc.text(`Report ID: ${reportId}  |  Generated: ${new Date().toUTCString()}`, 14, 29);

    let yPos = 46;

    // IP & Verdict Banner
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`Target IP Assessment: ${data.ip}`, 14, yPos);

    yPos += 7;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, yPos, 182, 24, 2, 2, 'F');

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text('Detection Verdict:', 20, yPos + 10);
    doc.text('Risk Score / Index:', 20, yPos + 18);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(alertColor[0], alertColor[1], alertColor[2]);
    doc.text(`${data.verdict.toUpperCase()}`, 70, yPos + 10);

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`${data.detectionScore ?? 0} / 100`, 70, yPos + 18);

    yPos += 34;

    // Intelligence Summary Table
    autoTable(doc, {
      startY: yPos,
      head: [['Attribute', 'Identified Value']],
      body: [
        ['Target IP Address', data.ip],
        ['IP Protocol Version', data.ipVersion || 'IPv4'],
        ['Reverse DNS (PTR)', data.reverseDns || 'None / Not Configured (NXDOMAIN)'],
        ['Geolocation Country', data.country || 'Unknown'],
        ['City / Region', data.city || 'Unknown'],
        ['Internet Service Provider', data.isp || 'Unknown'],
        ['Autonomous System (ASN)', data.asn || 'Unknown'],
        ['Identified VPN Provider', data.vpnProvider || 'None Detected / N/A'],
        ['Virtual Private Network (VPN)', data.isVpn ? 'YES (Detected)' : 'NO'],
        ['Proxy / Intermediary Node', data.isProxy ? 'YES (Detected)' : 'NO'],
        ['Tor Network Exit Node', data.isTor ? 'YES (Detected)' : 'NO'],
        ['Privacy Relay Endpoint', data.isPrivacyRelay ? 'YES (Detected)' : 'NO'],
        ['Hosting / Datacentre IP', data.isHosting ? 'YES (Detected)' : 'NO'],
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 70 },
      },
    });

    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 12;

    // Detection Signals & Evidence
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Technical Detection Signals & Evidence', 14, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    const signalsList = data.signals && data.signals.length > 0
      ? data.signals
      : ['No suspicious proxy, VPN, or datacentre routing signals identified.'];

    signalsList.forEach((sig) => {
      doc.text(`• ${sig}`, 18, yPos);
      yPos += 5;
    });

    yPos += 6;

    // Limitations & Methodology Disclaimer
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Forensic Limitations & Methodology Disclaimer', 14, yPos);

    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const disclaimer =
      'This network intelligence report is generated for network administration, threat assessment, and defensive cybersecurity analysis. ' +
      'Detection verdicts are derived from multi-provider heuristics, BGP routing tables, ASN classifications, and active proxy/VPN node databases. ' +
      'Because dynamic IP pools, cloud relays, and residential proxies change frequently, results are indicative and should not be considered infallible absolute proof. ' +
      'Geolocation estimates are approximate and do not identify an exact physical street address.';

    const splitDisclaimer = doc.splitTextToSize(disclaimer, 182);
    doc.text(splitDisclaimer, 14, yPos);

    const arrayBuffer = doc.output('arraybuffer');
    return Buffer.from(arrayBuffer);
  }

  /**
   * Generates a genuine Microsoft Word (.docx) document
   */
  static async generateDocx(data: ReportInvestigationData, reportId: string): Promise<Buffer> {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: 'VPN AND PROXY IP DETECTION SYSTEM',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: 'Network Intelligence & Forensic Investigation Report',
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: `Report Reference: ${reportId} | Date: ${new Date().toISOString()}`,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: '' }),

            new Paragraph({
              text: '1. Target Assessment Summary',
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Target IP Address: ', bold: true }),
                new TextRun(data.ip),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Detection Verdict: ', bold: true }),
                new TextRun({ text: data.verdict, bold: true }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Risk Score / Index: ', bold: true }),
                new TextRun(`${data.detectionScore ?? 0} / 100`),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Primary Analysis: ', bold: true }),
                new TextRun(data.explanation || 'No adverse network signatures detected.'),
              ],
            }),
            new Paragraph({ text: '' }),

            new Paragraph({
              text: '2. Network Intelligence Metrics',
              heading: HeadingLevel.HEADING_2,
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Metric', bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Value', bold: true })] })] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph('Reverse DNS (PTR)')] }),
                    new TableCell({ children: [new Paragraph(data.reverseDns || 'None / Not Configured')] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph('Country & City')] }),
                    new TableCell({ children: [new Paragraph(`${data.country || 'N/A'}, ${data.city || 'N/A'}`)] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph('ISP & ASN')] }),
                    new TableCell({ children: [new Paragraph(`${data.isp || 'N/A'} (${data.asn || 'N/A'})`)] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph('VPN Detected')] }),
                    new TableCell({ children: [new Paragraph(data.isVpn ? 'YES' : 'NO')] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph('Proxy Detected')] }),
                    new TableCell({ children: [new Paragraph(data.isProxy ? 'YES' : 'NO')] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph('Tor Exit Node')] }),
                    new TableCell({ children: [new Paragraph(data.isTor ? 'YES' : 'NO')] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph('Cloud / Datacentre Hosting')] }),
                    new TableCell({ children: [new Paragraph(data.isHosting ? 'YES' : 'NO')] }),
                  ],
                }),
              ],
            }),
            new Paragraph({ text: '' }),

            new Paragraph({
              text: '3. Detection Signals & Behavioral Indicators',
              heading: HeadingLevel.HEADING_2,
            }),
            ...(data.signals && data.signals.length > 0
              ? data.signals.map(s => new Paragraph({ text: `• ${s}` }))
              : [new Paragraph({ text: '• Standard consumer broadband routing indicators verified.' })]),
            new Paragraph({ text: '' }),

            new Paragraph({
              text: '4. Forensic Notice & Disclaimer',
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              text:
                'This report is generated for security auditing and forensic network analysis purposes. ' +
                'Results are indicative of network configurations at the timestamp of interrogation and should be interpreted by qualified network analysts.',
            }),
          ],
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }

  /**
   * Generates a CSV export with formula injection sanitization
   */
  static generateCsv(data: ReportInvestigationData, reportId: string): string {
    const headers = [
      'Report_ID',
      'Timestamp',
      'IP_Address',
      'Verdict',
      'Risk_Score',
      'Is_VPN',
      'Is_Proxy',
      'Is_Tor',
      'Is_Privacy_Relay',
      'Is_Hosting',
      'VPN_Provider',
      'Reverse_DNS',
      'Country',
      'City',
      'ISP',
      'ASN',
      'Signals',
    ];

    const values = [
      sanitizeCsvValue(reportId),
      sanitizeCsvValue(new Date().toISOString()),
      sanitizeCsvValue(data.ip),
      sanitizeCsvValue(data.verdict),
      sanitizeCsvValue(data.detectionScore ?? 0),
      sanitizeCsvValue(data.isVpn ? 'TRUE' : 'FALSE'),
      sanitizeCsvValue(data.isProxy ? 'TRUE' : 'FALSE'),
      sanitizeCsvValue(data.isTor ? 'TRUE' : 'FALSE'),
      sanitizeCsvValue(data.isPrivacyRelay ? 'TRUE' : 'FALSE'),
      sanitizeCsvValue(data.isHosting ? 'TRUE' : 'FALSE'),
      sanitizeCsvValue(data.vpnProvider || ''),
      sanitizeCsvValue(data.reverseDns || ''),
      sanitizeCsvValue(data.country || ''),
      sanitizeCsvValue(data.city || ''),
      sanitizeCsvValue(data.isp || ''),
      sanitizeCsvValue(data.asn || ''),
      sanitizeCsvValue((data.signals || []).join('; ')),
    ];

    return `${headers.join(',')}\n${values.join(',')}\n`;
  }

  /**
   * Generates a structured JSON report
   */
  static generateJson(data: ReportInvestigationData, reportId: string): object {
    return {
      metadata: {
        system: 'VPN and Proxy IP Detection System',
        reportId,
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
        notice: 'For defensive network analysis and threat assessment.',
      },
      target: {
        ip: data.ip,
        version: data.ipVersion || 'IPv4',
        reverseDns: data.reverseDns || null,
      },
      intelligence: {
        country: data.country,
        city: data.city,
        isp: data.isp,
        asn: data.asn,
      },
      detection: {
        verdict: data.verdict,
        riskScore: data.detectionScore ?? 0,
        isVpn: Boolean(data.isVpn),
        isProxy: Boolean(data.isProxy),
        isTor: Boolean(data.isTor),
        isPrivacyRelay: Boolean(data.isPrivacyRelay),
        isHosting: Boolean(data.isHosting),
        vpnProvider: data.vpnProvider || null,
        signals: data.signals || [],
        explanation: data.explanation || '',
      },
    };
  }
}
