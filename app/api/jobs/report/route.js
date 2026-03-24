import { connectDB } from '@/lib/db';
import Job from '@/models/Job';
import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month'); // expects "YYYY-MM"
  const format = searchParams.get('format'); // "excel" or "pdf"

  if (!month || !format) {
    return Response.json({ success: false, error: 'Missing month or format parameter' }, { status: 400 });
  }

  const [year, monthNum] = month.split('-').map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 1); // exclusive

  try {
    await connectDB();
    const jobs = await Job.find({
      createdAt: { $gte: startDate, $lt: endDate },
    }).sort({ createdAt: 1 });

    const monthLabel = startDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // ─── Excel ────────────────────────────────────────────────────────────────
    if (format === 'excel') {
      const headers = ['Job #', 'Title', 'Material', 'Description', 'Status', 'Created Date'];

      const rows = jobs.map((job) => [
        job.jobNumber,
        job.title,
        job.material,
        job.description,
        job.status.charAt(0).toUpperCase() + job.status.slice(1),
        new Date(job.createdAt).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric',
        }),
      ]);

      const worksheetData = [headers, ...rows];

      if (jobs.length === 0) {
        worksheetData.push(['No jobs found for this period.']);
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);

      // Column widths
      ws['!cols'] = [
        { wch: 8 },  // Job #
        { wch: 25 }, // Title
        { wch: 20 }, // Material
        { wch: 40 }, // Description
        { wch: 12 }, // Status
        { wch: 18 }, // Created Date
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Jobs Report');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const filename = `jobs-report-${month}.xlsx`;
      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // ─── PDF ─────────────────────────────────────────────────────────────────
    if (format === 'pdf') {
      const chunks = [];

      await new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', resolve);
        doc.on('error', reject);

        // Title
        doc
          .font('Helvetica-Bold')
          .fontSize(20)
          .text(`Jobs Monthly Report — ${monthLabel}`, { align: 'center' });

        doc.moveDown(0.5);
        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor('#555555')
          .text(`Generated on: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });

        doc.moveDown(0.5);

        // Summary
        const completedCount = jobs.filter((j) => j.status === 'completed').length;
        const pendingCount = jobs.filter((j) => j.status === 'pending').length;
        doc
          .font('Helvetica')
          .fontSize(11)
          .fillColor('#333333')
          .text(`Total Jobs: ${jobs.length}   |   Completed: ${completedCount}   |   Pending: ${pendingCount}`, { align: 'center' });

        doc.moveDown(1);

        if (jobs.length === 0) {
          doc
            .font('Helvetica-Oblique')
            .fontSize(13)
            .fillColor('#888888')
            .text('No jobs found for this period.', { align: 'center' });
        } else {
          // Table setup
          const tableTop = doc.y;
          const colWidths = [50, 130, 110, 230, 80, 110];
          const headers = ['Job #', 'Title', 'Material', 'Description', 'Status', 'Created Date'];
          const rowHeight = 22;
          const margin = 40;

          // Draw header row background
          doc.rect(margin, tableTop, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill('#1d4ed8');

          let x = margin;
          headers.forEach((header, i) => {
            doc
              .font('Helvetica-Bold')
              .fontSize(10)
              .fillColor('#ffffff')
              .text(header, x + 4, tableTop + 6, { width: colWidths[i] - 8, lineBreak: false });
            x += colWidths[i];
          });

          // Draw data rows
          jobs.forEach((job, rowIndex) => {
            const rowTop = tableTop + rowHeight + rowIndex * rowHeight;
            const bgColor = rowIndex % 2 === 0 ? '#f0f4ff' : '#ffffff';

            doc.rect(margin, rowTop, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill(bgColor);

            const row = [
              job.jobNumber,
              job.title,
              job.material,
              job.description.length > 60 ? job.description.substring(0, 57) + '...' : job.description,
              job.status.charAt(0).toUpperCase() + job.status.slice(1),
              new Date(job.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            ];

            x = margin;
            row.forEach((cell, i) => {
              const textColor = cell === 'Completed' ? '#15803d' : cell === 'Pending' ? '#b45309' : '#111827';
              doc
                .font('Helvetica')
                .fontSize(9)
                .fillColor(textColor)
                .text(String(cell), x + 4, rowTop + 7, { width: colWidths[i] - 8, lineBreak: false });
              x += colWidths[i];
            });

            // Row border
            doc.rect(margin, rowTop, colWidths.reduce((a, b) => a + b, 0), rowHeight).stroke('#e5e7eb');
          });
        }

        doc.end();
      });

      const pdfBuffer = Buffer.concat(chunks);
      const filename = `jobs-report-${month}.pdf`;

      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return Response.json({ success: false, error: 'Invalid format. Use "excel" or "pdf".' }, { status: 400 });
  } catch (error) {
    console.error('Report generation error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
