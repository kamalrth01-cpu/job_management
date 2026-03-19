'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import JobCard from '@/components/JobCard';

export default function WorkerPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'

  // Initialize Socket.IO connection
  useEffect(() => {
    const socketInstance = io();

    socketInstance.on('connect', () => {
      console.log('✓ Connected to server');
    });

    // Listen for new jobs created by admin
    socketInstance.on('jobCreated', (newJob) => {
      console.log('📢 New job created (real-time):', newJob.jobNumber);
      setJobs((prev) => [newJob, ...prev]);
    });

    // Listen for job updates (when completed)
    socketInstance.on('jobUpdated', (updatedJob) => {
      console.log('📢 Job updated (real-time):', updatedJob.jobNumber);
      setJobs((prev) =>
        prev.map((job) => (job._id === updatedJob._id ? updatedJob : job))
      );
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs');
      const data = await response.json();
      if (data.success) {
        setJobs(data.data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobCompleted = (completedJob) => {
    setJobs((prev) =>
      prev.map((job) => (job._id === completedJob._id ? completedJob : job))
    );
  };

  const pendingJobs = jobs.filter((j) => j.status === 'pending');
  const completedJobs = jobs.filter((j) => j.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg p-6 mb-6 shadow-lg">
          <h1 className="text-3xl font-bold mb-2">👷 Worker Dashboard</h1>
          <p className="text-green-100">View and complete assigned jobs</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div 
            className={`rounded-lg p-4 shadow cursor-pointer transition ${filter === 'all' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'}`}
            onClick={() => setFilter('all')}
          >
            <p className="text-gray-700 font-semibold">Total Jobs</p>
            <p className="text-3xl font-bold text-gray-600">{jobs.length}</p>
          </div>
          <div 
            className={`rounded-lg p-4 shadow cursor-pointer transition ${filter === 'pending' ? 'bg-orange-200 border-2 border-orange-500' : 'bg-orange-100'}`}
            onClick={() => setFilter('pending')}
          >
            <p className="text-gray-700 font-semibold">Pending</p>
            <p className="text-3xl font-bold text-orange-600">{pendingJobs.length}</p>
          </div>
          <div 
            className={`rounded-lg p-4 shadow cursor-pointer transition ${filter === 'completed' ? 'bg-green-200 border-2 border-green-500' : 'bg-green-100'}`}
            onClick={() => setFilter('completed')}
          >
            <p className="text-gray-700 font-semibold">Completed</p>
            <p className="text-3xl font-bold text-green-600">{completedJobs.length}</p>
          </div>
        </div>

        {/* Pending Jobs Section */}
        {(filter === 'all' || filter === 'pending') && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">⏳ Pending Jobs</h2>

            {loading ? (
              <div className="text-center text-gray-600 py-8">⏳ Loading jobs...</div>
            ) : pendingJobs.length === 0 ? (
              <div className="text-center text-gray-600 py-8">No pending jobs</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pendingJobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    onComplete={handleJobCompleted}
                    isWorker={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Completed Jobs Section */}
        {(filter === 'all' || filter === 'completed') && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">✓ Completed Jobs</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {completedJobs.map((job) => (
                <JobCard key={job._id} job={job} isWorker={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
