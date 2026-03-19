import { connectDB } from '@/lib/db';
import Job from '@/models/Job';
import { broadcastJobUpdated } from '@/lib/socket';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// GET /api/jobs/[id] - Fetch a single job
export async function GET(request, { params }) {
  try {
    await connectDB();
    const job = await Job.findById(params.id);
    if (!job) {
      return Response.json({ success: false, error: 'Job not found' }, { status: 404 });
    }
    return Response.json({ success: true, data: job }, { status: 200 });
  } catch (error) {
    console.error('Error fetching job:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/jobs/[id] - Update a job
export async function PUT(request, { params }) {
  // Check role
  if (request.headers.get('x-role') !== 'admin') {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectDB();

    const formData = await request.formData();

    const title = formData.get('title');
    const jobNumber = formData.get('jobNumber');
    const material = formData.get('material');
    const description = formData.get('description');
    const files = formData.getAll('files');
    const removeFiles = formData.get('removeFiles') ? JSON.parse(formData.get('removeFiles')) : [];

    // Validate required fields
    if (!title || !jobNumber || !material || !description) {
      return Response.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if job exists
    const existingJob = await Job.findById(params.id);
    if (!existingJob) {
      return Response.json({ success: false, error: 'Job not found' }, { status: 404 });
    }

    // Check if job number already exists (excluding current job)
    const duplicateJob = await Job.findOne({ jobNumber, _id: { $ne: params.id } });
    if (duplicateJob) {
      return Response.json(
        { success: false, error: 'Job number already exists' },
        { status: 400 }
      );
    }

    // Handle file removals
    let updatedFiles = existingJob.files || [];
    for (const filePath of removeFiles) {
      const fullPath = join(process.cwd(), 'public', filePath);
      try {
        if (existsSync(fullPath)) {
          await unlink(fullPath);
        }
      } catch (error) {
        console.error('Error removing file:', error);
      }
      updatedFiles = updatedFiles.filter(f => f !== filePath);
    }

    // Handle new file uploads
    const uploadDir = join(process.cwd(), 'public/uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    for (const file of files) {
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${file.name}`;
        const filepath = join(uploadDir, filename);

        await writeFile(filepath, buffer);
        updatedFiles.push(`/uploads/${filename}`);
      }
    }

    // Update job document
    const updatedJob = await Job.findByIdAndUpdate(
      params.id,
      {
        title,
        jobNumber,
        material,
        description,
        files: updatedFiles,
      },
      { new: true }
    );

    // Broadcast update via Socket.IO
    broadcastJobUpdated(updatedJob);

    return Response.json({ success: true, data: updatedJob }, { status: 200 });
  } catch (error) {
    console.error('Error updating job:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/jobs/[id] - Delete a job
export async function DELETE(request, { params }) {
  // Check role
  if (request.headers.get('x-role') !== 'admin') {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectDB();

    // Find the job first to get file paths
    const job = await Job.findById(params.id);
    if (!job) {
      return Response.json({ success: false, error: 'Job not found' }, { status: 404 });
    }

    // Remove associated files
    if (job.files && job.files.length > 0) {
      for (const filePath of job.files) {
        const fullPath = join(process.cwd(), 'public', filePath);
        try {
          if (existsSync(fullPath)) {
            await unlink(fullPath);
          }
        } catch (error) {
          console.error('Error removing file:', error);
        }
      }
    }

    // Delete the job
    await Job.findByIdAndDelete(params.id);

    // Broadcast update (job deleted)
    broadcastJobUpdated({ _id: params.id, deleted: true });

    return Response.json({ success: true, message: 'Job deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting job:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}