import { connectDB } from '@/lib/db';
import Job from '@/models/Job';
import * as XLSX from 'xlsx';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month'); // expects "YYYY-MM"
  const format = searchParams.get('format'); // "excel"

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

    return Response.json({ success: false, error: 'Invalid format. Use "excel".' }, { status: 400 });
  } catch (error) {
    console.error('Report generation error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
