# 📋 Real-Time Job Management System

A modern, full-stack web application for managing jobs in real-time with role-based access (Admin & Worker).

## ✨ Features

### 👨‍💼 Admin Dashboard
- ✓ Create jobs with detailed information
- ✓ Assign unique job numbers
- ✓ Add job materials and descriptions
- ✓ Upload file attachments
- ✓ View all jobs with real-time status updates
- ✓ See pending vs completed jobs at a glance

### 👷 Worker Dashboard
- ✓ View all available jobs in real-time
- ✓ See job details and attachments
- ✓ Mark jobs as completed instantly
- ✓ Track pending vs completed jobs
- ✓ Receive live updates via Socket.IO

### 🔌 Real-Time Features
- ✓ Instant job creation notifications
- ✓ Live job status updates
- ✓ Socket.IO for bidirectional communication
- ✓ No page refresh needed

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** JavaScript
- **Database:** MongoDB with Mongoose
- **Real-Time:** Socket.IO
- **Styling:** Tailwind CSS
- **File Uploads:** Cloudinary (v2)
- **HTTP Client:** Axios

## 📁 Project Structure

```
job_manage/
├── app/
│   ├── api/
│   │   └── jobs/
│   │       ├── route.js             # GET/POST jobs
│   │       └── [id]/
│   │           └── complete/
│   │               └── route.js      # PUT to complete job
│   ├── admin/
│   │   └── page.js                  # Admin dashboard
│   ├── worker/
│   │   └── page.js                  # Worker dashboard
│   ├── layout.js                    # Root layout
│   ├── page.js                      # Home page
│   └── globals.css                  # Global styles
├── components/
│   ├── JobForm.js                   # Job creation form
│   ├── JobCard.js                   # Job display card
│   └── RoleToggle.js                # Role switcher
├── lib/
│   ├── db.js                        # MongoDB connection
│   └── socket.js                    # Socket.IO setup
├── models/
│   └── Job.js                       # Mongoose Job schema
├── public/
│   └── uploads/                     # File uploads directory
├── server.js                        # Custom Next.js server
├── package.json
├── tailwind.config.js
├── next.config.js
└── .env.example                     # Environment variables template
```

## 🚀 Setup Instructions

### 1️⃣ Prerequisites

Make sure you have the following installed:
- **Node.js 16+** ([Download](https://nodejs.org/))
- **MongoDB** ([Download](https://www.mongodb.com/try/download/community)) OR MongoDB Atlas account ([Free Tier](https://www.mongodb.com/cloud/atlas))

### 2️⃣ Clone/Extract Project

```bash
cd job_manage
```

### 3️⃣ Install Dependencies

```bash
npm install
```

### 4️⃣ Setup MongoDB

#### Option A: Local MongoDB
1. Install MongoDB Community Edition from the official website
2. Start MongoDB service:
   - **Windows:** MongoDB runs as a service automatically
   - **Mac:** `brew services start mongodb-community`
   - **Linux:** `sudo systemctl start mongod`

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a cluster
4. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/job_manage`)

### 5️⃣ Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and update the `MONGODB_URI`:

**For Local MongoDB:**
```
MONGODB_URI=mongodb://localhost:27017/job_manage
PORT=3000
NODE_ENV=development
```

**For MongoDB Atlas:**
```
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/job_manage
PORT=3000
NODE_ENV=development
```

### 6️⃣ Run Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

### 7️⃣ Access the Application

- **Home Page:** http://localhost:3000
- **Admin Dashboard:** http://localhost:3000/admin
- **Worker Dashboard:** http://localhost:3000/worker

## 📝 Usage Guide

### For Admins
1. Navigate to `/admin` or click "Admin" button on home
2. Fill out the job creation form:
   - Enter job title (e.g., "Assemble Part A")
   - Enter unique job number (e.g., "JOB-001")
   - Select material type
   - Add detailed description
   - Optionally attach files
3. Click "Create Job"
4. New job appears instantly for workers
5. View real-time status updates as workers complete jobs

### For Workers
1. Navigate to `/worker` or click "Worker" button on home
2. View all pending jobs in real-time
3. Click on any job to see full details and attachments
4. Click "Mark as Completed" to finish a job
5. Completed jobs move to the "Completed" section
6. Admin sees the update instantly

## 🔗 Database Schema

### Job Model
```javascript
{
  title: String,                    // Job name
  jobNumber: String (unique),       // Unique identifier
  material: String,                 // Material type
  description: String,              // Detailed description
  files: [String],                  // Array of file URLs
  status: String,                   // "pending" or "completed"
  createdAt: Date,                  // Auto timestamp
  updatedAt: Date                   // Auto timestamp
}
```

## 💡 Key Features Explained

### Real-Time Updates (Socket.IO)
- Workers instantly see new jobs when admins create them
- Admins instantly see job completions from workers
- No database polling - pure event-driven communication

### File Uploads
- Files are uploaded directly to **Cloudinary**
- Secure URLs are stored in the MongoDB database
- Supports various file types (images, documents, etc.)

### Job Status
- **Pending:** New jobs waiting to be completed
- **Completed:** Jobs finished by workers

## 🧪 Testing the System

### Test Flow:
1. Open two browser windows/tabs
2. One as Admin (`/admin`), one as Worker (`/worker`)
3. Create a job in the Admin tab
4. Watch it appear instantly in Worker tab
5. Mark it complete in Worker tab
6. Watch status update instantly in Admin tab

## ⚙️ Build & Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

## 🐛 Troubleshooting

### "ECONNREFUSED: Connection refused to MongoDB"
- **Solution:** Ensure MongoDB is running
  - Check service: `mongosh`
  - Local: Start MongoDB service
  - Atlas: Verify connection string and IP whitelist

### "Port 3000 already in use"
- **Solution:** Kill the process or use different port
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -i :3000
  kill -9 <PID>
  ```

### Socket.IO not connecting
- **Solution:** Ensure the server is using `server.js`
  - Verify `npm run dev` is running the custom server
  - Check browser console for connection errors

### Files not uploading
- **Solution:** Check file permissions
  - Ensure `/public/uploads` directory exists and is writable
  - Check file size limits

## 📦 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | Yes | - | MongoDB connection string |
| `CLOUDINARY_CLOUD_NAME` | Yes | - | Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | Yes | - | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Yes | - | Cloudinary API Secret |
| `PORT` | No | 3000 | Server port |
| `NODE_ENV` | No | development | Environment (development/production) |

## 🔐 Security Notes

- This system uses simple role switching (UI-based)
- **Note:** In production, implement proper authentication
- File uploads should have validation and size limits
- Add rate limiting for API endpoints
- Validate all user inputs server-side

## 📚 Technologies Deep Dive

### Next.js App Router
- Server-side rendering for better performance
- API routes for backend functionality
- Automatic code splitting

### Socket.IO
- Real-time bidirectional communication
- Event-driven architecture
- Automatic reconnection

### Mongoose
- Schema validation
- Connection pooling
- Type safety for MongoDB

## 🎯 Future Enhancements

- [ ] User authentication (JWT/OAuth)
- [ ] Role-based access control (RBAC)
- [ ] Job assignment to specific workers
- [ ] Priority levels
- [ ] Search and filter functionality
- [ ] Job history/analytics
- [ ] Email notifications
- [ ] Worker profiles and ratings

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Check MongoDB and Socket.IO logs
4. Ensure all dependencies are installed

---

**Created:** March 2026  
**Version:** 1.0.0  
**License:** MIT
