import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    jobNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    material: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    files: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate model compilation
const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);

export default Job;
