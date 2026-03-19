import { connectDB } from '@/lib/db';
import Job from '@/models/Job';
import { broadcastJobUpdated } from '@/lib/socket';

// PUT /api/jobs/[id]/complete - Mark job as completed
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // Find and update the job
    const job = await Job.findByIdAndUpdate(
      id,
      { status: 'completed' },
      { new: true } // Return updated document
    );

    if (!job) {
      return Response.json({ success: false, error: 'Job not found' }, { status: 404 });
    }

    // Broadcast update to admin via Socket.IO
    broadcastJobUpdated(job);

    return Response.json({ success: true, data: job }, { status: 200 });
  } catch (error) {
    console.error('Error updating job:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
