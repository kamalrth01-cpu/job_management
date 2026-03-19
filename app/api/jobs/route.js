import { connectDB } from '@/lib/db';
import Job from '@/models/Job';
import { broadcastJobCreated, broadcastJobUpdated } from '@/lib/socket';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// GET /api/jobs - Fetch all jobs
export async function GET(request) {
  try {
    await connectDB();
    const jobs = await Job.find().sort({ createdAt: -1 });
    return Response.json({ success: true, data: jobs }, { status: 200 });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/jobs - Create a new job with file uploads
export async function POST(request) {
  // Check role
  if (request.headers.get('x-role') !== 'admin') {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectDB();

    const formData = await request.formData();

    const title = formData.get('title');
    const material = formData.get('material');
    const description = formData.get('description');
    const files = formData.getAll('files');

    // Validate required fields
    if (!title || !material || !description) {
      return Response.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate next job number
    const lastJob = await Job.findOne().sort({ jobNumber: -1 });
    let nextJobNumber = 1;
    if (lastJob && lastJob.jobNumber) {
      const lastNum = parseInt(lastJob.jobNumber, 10);
      if (!isNaN(lastNum)) {
        nextJobNumber = lastNum + 1;
      }
    }
    const jobNumber = nextJobNumber.toString();

    // Handle file uploads
    const uploadDir = join(process.cwd(), 'public/uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uploadedFiles = [];
    for (const file of files) {
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${file.name}`;
        const filepath = join(uploadDir, filename);

        await writeFile(filepath, buffer);
        uploadedFiles.push(`/uploads/${filename}`);
      }
    }

    // Create job document
    const newJob = await Job.create({
      title,
      jobNumber,
      material,
      description,
      files: uploadedFiles,
      status: 'pending',
    });

    // Broadcast to workers via Socket.IO
    broadcastJobCreated(newJob);

    return Response.json({ success: true, data: newJob }, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
