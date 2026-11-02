import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { ReportService } from '../services/reportService.js';
import { reportGenerationRequestSchema } from '../validators/index.js';
import { logAuditEvent, getSupabaseClient } from '../services/supabaseService.js';

export async function generateReportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = reportGenerationRequestSchema.parse(req.body);
    const { format, investigation } = validated;
    const reportId = `REP-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Audit log
    if (req.user) {
      logAuditEvent({
        userId: req.user.id,
        action: 'GENERATE_REPORT',
        targetResource: investigation.ip,
        metadata: { format, reportId },
      });

      // Save report record in Supabase if configured
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('report_records').insert({
          user_id: req.user.id,
          report_format: format,
          file_name: `forensic-report-${investigation.ip}-${reportId}.${format}`,
        });
      }
    }

    if (format === 'json') {
      const jsonData = ReportService.generateJson(investigation, reportId);
      return res.json({
        success: true,
        reportId,
        data: jsonData,
      });
    }

    if (format === 'csv') {
      const csvData = ReportService.generateCsv(investigation, reportId);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="forensic-report-${investigation.ip}-${reportId}.csv"`);
      return res.send(csvData);
    }

    if (format === 'pdf') {
      const pdfBuffer = await ReportService.generatePdf(investigation, reportId);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="forensic-report-${investigation.ip}-${reportId}.pdf"`);
      return res.send(pdfBuffer);
    }

    if (format === 'docx') {
      const docxBuffer = await ReportService.generateDocx(investigation, reportId);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      res.setHeader('Content-Disposition', `attachment; filename="forensic-report-${investigation.ip}-${reportId}.docx"`);
      return res.send(docxBuffer);
    }

    return res.status(400).json({ success: false, error: 'Unsupported format requested' });
  } catch (err) {
    next(err);
  }
}
