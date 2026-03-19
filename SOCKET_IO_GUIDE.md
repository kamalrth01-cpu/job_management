# Socket.IO Real-Time Implementation Guide

## Overview
This project uses Socket.IO for real-time communication between admins and workers.
The server is initialized in `server.js` and events are handled in `lib/socket.js`.

## Server Setup (server.js)

The custom Next.js server initializes Socket.IO:

```javascript
import { initializeSocket } from './lib/socket.js';

// Create HTTP server and initialize Socket.IO
const server = createServer(async (req, res) => {
  // Handle requests...
});

initializeSocket(server);
server.listen(port);
```

**Why custom server?**
- Next.js dev server (`next dev`) doesn't support WebSocket natively
- Custom server allows Socket.IO to coexist with Next.js
- All HTTP requests still go through Next.js App Router

## Socket.IO Events

### Broadcasting Events (from api/jobs/route.js)

When admin creates job:
```javascript
broadcastJobCreated(job);  // Emits 'jobCreated' to all workers
```

When worker completes job:
```javascript
broadcastJobUpdated(job);  // Emits 'jobUpdated' to all admins/workers
```

### Client Listening (components)

In Admin Page (/admin/page.js):
```javascript
socketInstance.on('jobUpdated', (updatedJob) => {
  // Update job list when worker completes
  setJobs(prev => prev.map(j => j._id === updatedJob._id ? updatedJob : j));
});
```

In Worker Page (/worker/page.js):
```javascript
socketInstance.on('jobCreated', (newJob) => {
  // Add new job to list when admin creates
  setJobs(prev => [newJob, ...prev]);
});
```

## Connection Flow

### Admin Creates Job:
```
1. Admin submits form
2. POST /api/jobs (file upload + form data)
3. Server creates job in MongoDB
4. broadcastJobCreated() emits event
5. All connected workers receive 'jobCreated'
6. Worker UIs update instantly
```

### Worker Completes Job:
```
1. Worker clicks "Mark as Completed"
2. PUT /api/jobs/{id}/complete
3. Server updates job status in MongoDB
4. broadcastJobUpdated() emits event
5. All connected clients receive 'jobUpdated'
6. Admin and Worker UIs update instantly
```

## Global Socket Instance

The socket is stored globally to persist across requests:
```javascript
let io = null;

export function initializeSocket(httpServer) {
  if (io) return io;  // Return existing instance
  io = new Server(httpServer, {...});
  return io;
}

export function getSocket() {
  return io;  // Get current instance for events
}
```

## Client Connection

Each page connects a Socket.IO client in useEffect:
```javascript
useEffect(() => {
  const socketInstance = io();  // Auto-connects to /socket.io
  socketInstance.on('connect', () => console.log('Connected'));
  return () => socketInstance.disconnect();
}, []);
```

## Event Messages Flow

```
┌─────────────┐
│   Admin     │
│  Dashboard  │
└──────┬──────┘
       │ POST /api/jobs
       ├─────────────────────────────────┐
       │                                 │
   ┌───▼────────────────────────────────┘
   │
┌──▼──────────────────┐
│  Next.js API Route  │
│  /api/jobs          │
│                     │
│ - Validate data     │
│ - Save to MongoDB   │
│ - Call broadcast    │
└──┬──────────────────┘
   │
   │ broadcastJobCreated()
   │
┌──▼────────────────────┐
│   Socket.IO Server    │
│  io.emit('jobCreated')│
└──┬────────────────────┘
   │
   ├──────────────────────────────────┐
   │                                  │
┌──▼──────────────────┐    ┌─────────▼──────────┐
│   Worker Client #1  │    │  Worker Client #2  │
│ socket.on('created')│    │ socket.on('created')│
│ Re-renders list     │    │ Re-renders list    │
└─────────────────────┘    └────────────────────┘
```

## Configuration

### CORS Settings (lib/socket.js):
```javascript
io = new Server(httpServer, {
  cors: {
    origin: '*',        // Allow all origins
    methods: ['GET', 'POST'],
  },
});
```

For production, restrict to specific domains:
```javascript
cors: {
  origin: ['https://yourapp.com'], 
  credentials: true
}
```

## Debugging

### Server-side logging:
```javascript
console.log('✓ Worker connected:', socket.id);
console.log('📢 Job created broadcast:', job.jobNumber);
```

### Client-side logging:
```javascript
socketInstance.on('connect', () => console.log('Ready!'));
socketInstance.on('jobCreated', (job) => console.log('New job:', job));
```

### Browser DevTools:
1. Open Network tab
2. Filter by "WS" (WebSocket)
3. Watch /socket.io messages

## Troubleshooting

### WebSocket Connection Failed
- Ensure server.js is running (not `next dev`)
- Check if port 3000 is accessible
- Verify no firewall blocking WebSocket

### Events Not Broadcasting
- Check console logs in server
- Verify broadcastJobCreated() is called
- Check client event listeners are registered

### Stale Data
- Each client re-fetches on mount
- Socket events update state in real-time
- No caching issues with this approach

## Performance Notes

- Socket.IO uses long-polling fallback if WebSocket unavailable
- Events are ephemeral (not persisted for offline users)
- Database is source of truth, Socket.IO shows real-time views
- Scales to ~1000s of concurrent connections on single server

## Security Considerations

- Add rate limiting for events
- Validate all data in API routes (not Socket.IO)
- Add authentication before subscribing to events
- Use namespaces to separate admin/worker connections

Example (future enhancement):
```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!validateToken(token)) return next(new Error('Unauthorized'));
  next();
});
```
