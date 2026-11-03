import { describe, it, expect } from 'vitest';
import { ReportService, sanitizeCsvValue } from '../src/services/reportService.js';

describe('Report Generation & Formula Sanitization', () => {
  it('sanitizes dangerous CSV spreadsheet formula triggers', () => {
    // Dangerous formula prefixes: = + - @ \t \r
    expect(sanitizeCsvValue('=1+2')).toBe(`"'=1+2"`);
    expect(sanitizeCsvValue('+CMD|...')).toBe(`"'+CMD|..."`);
    expect(sanitizeCsvValue('-123')).toBe(`"'-123"`);
    expect(sanitizeCsvValue('@SUM(A1:A10)')).toBe(`"'@SUM(A1:A10)"`);
    expect(sanitizeCsvValue('Standard Text')).toBe('"Standard Text"');
  });

  it('generates structured JSON report with system metadata', () => {
    const report = ReportService.generateJson(
      {
        ip: '8.8.8.8',
        verdict: 'Clean',
        detectionScore: 0,
        isVpn: false,
        isProxy: false,
        country: 'United States',
      },
      'TEST-REP-001'
    ) as any;

    expect(report.metadata.reportId).toBe('TEST-REP-001');
    expect(report.target.ip).toBe('8.8.8.8');
    expect(report.detection.verdict).toBe('Clean');
  });
});
