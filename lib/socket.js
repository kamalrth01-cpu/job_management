import { Server } from 'socket.io';

// Global socket.io instance
let io = null;

export function initializeSocket(httpServer) {
  if (io) {
    return io;
  }

  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('✓ Worker connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('✗ Worker disconnected:', socket.id);
    });
  });

  return io;
}

export function getSocket() {
  return io;
}

// Emit events to all connected workers
export function broadcastJobCreated(job) {
  if (io) {
    io.emit('jobCreated', job);
  }
  console.log('📢 Job created broadcast:', job.jobNumber);
}

export function broadcastJobUpdated(job) {
  if (io) {
    io.emit('jobUpdated', job);
  }
  console.log('📢 Job updated broadcast:', job.jobNumber);
}
