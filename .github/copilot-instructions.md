# Copilot Instructions for Job Management System

## Project Overview
Real-time job management system built with Next.js, MongoDB, and Socket.IO. 
Admins create jobs, workers complete them—all with live updates.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** JavaScript
- **Database:** MongoDB + Mongoose
- **Real-Time:** Socket.IO
- **Styling:** Tailwind CSS
- **File Uploads:** Multer + API routes

## Project Structure
```
/app           - Next.js App Router pages and API routes
/components    - Reusable React components
/lib           - Utilities (DB connection, Socket.IO)
/models        - Mongoose schemas
/public        - Static assets and file uploads
server.js      - Custom Next.js server for Socket.IO
```

## Key Files
- `server.js` - Custom server that initializes Socket.IO
- `lib/db.js` - MongoDB connection utility
- `lib/socket.js` - Socket.IO event handlers
- `models/Job.js` - Job database schema
- `app/api/jobs/route.js` - Create/Get jobs
- `app/admin/page.js` - Admin dashboard
- `app/worker/page.js` - Worker dashboard

## Core Features
✓ Admin can create jobs with file attachments
✓ Workers can view and complete jobs
✓ Real-time updates via Socket.IO
✓ Responsive Tailwind UI
✓ MongoDB persistence

## Development Commands
```bash
npm install                # Install dependencies
npm run dev               # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
```

## Setup Instructions
1. Install Node.js 16+
2. Setup MongoDB locally or Atlas
3. Create `.env.local` with MONGODB_URI
4. Run `npm install && npm run dev`
5. Navigate to http://localhost:3000

## API Routes
- `GET /api/jobs` - Fetch all jobs
- `POST /api/jobs` - Create new job (with file upload)
- `PUT /api/jobs/[id]/complete` - Mark job as completed

## Socket.IO Events
- `jobCreated` - Broadcast when admin creates job
- `jobUpdated` - Broadcast when worker completes job

## Common Workflows
### Creating a Job (Admin)
1. Go to `/admin`
2. Fill form with job details
3. Optionally attach files
4. Click "Create Job"
5. Socket.IO broadcasts to all workers

### Completing a Job (Worker)
1. Go to `/worker`
2. View pending jobs (updated in real-time)
3. Click "Mark as Completed"
4. Socket.IO broadcasts update to admin

## MongoDB Connection
- Local: `mongodb://localhost:27017/job_manage`
- Atlas: `mongodb+srv://user:pass@cluster.mongodb.net/job_manage`

## Important Notes
- Server uses `server.js` (NOT next dev) for Socket.IO support
- File uploads go to `/public/uploads`
- No authentication required (simple role UI)
- Job numbers must be unique
