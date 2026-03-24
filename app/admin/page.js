'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import JobForm from '@/components/JobForm';
import JobCard from '@/components/JobCard';

export default function AdminPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'

  // Report state
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const [reportMonth, setReportMonth] = useState(currentMonth);
  const [reportLoading, setReportLoading] = useState({ excel: false, pdf: false });

  const downloadReport = async (format) => {
    setReportLoading((prev) => ({ ...prev, [format]: true }));
    try {
      const res = await fetch(`/api/jobs/report?month=${reportMonth}&format=${format}`);
      if (!res.ok) throw new Error('Failed to generate report');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jobs-report-${reportMonth}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error downloading report: ' + err.message);
    } finally {
      setReportLoading((prev) => ({ ...prev, [format]: false }));
    }
  };

  // Initialize Socket.IO connection
  useEffect(() => {
    const socketInstance = io();

    socketInstance.on('connect', () => {
      console.log('✓ Connected to server');
    });

    // Listen for new jobs created by workers updating
    socketInstance.on('jobUpdated', (updatedJob) => {
      console.log('📢 Job updated (real-time):', updatedJob.jobNumber);
      if (updatedJob.deleted) {
        setJobs((prev) => prev.filter((job) => job._id !== updatedJob._id));
      } else {
        setJobs((prev) =>
          prev.map((job) => (job._id === updatedJob._id ? updatedJob : job))
        );
      }
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

  const handleJobCreated = (newJob) => {
    setJobs((prev) => [newJob, ...prev]);
  };

  const handleJobUpdated = (updatedJob) => {
    setJobs((prev) =>
      prev.map((job) => (job._id === updatedJob._id ? updatedJob : job))
    );
    setEditingJob(null);
  };

  const handleEdit = (job) => {
    setEditingJob(job);
  };

  const handleDelete = (jobId) => {
    setJobs((prev) => prev.filter((job) => job._id !== jobId));
  };

  const handleCancelEdit = () => {
    setEditingJob(null);
  };

  const completedCount = jobs.filter((j) => j.status === 'completed').length;
  const pendingCount = jobs.filter((j) => j.status === 'pending').length;

  const filteredJobs = jobs.filter((job) => {
    if (filter === 'pending') return job.status === 'pending';
    if (filter === 'completed') return job.status === 'completed';
    return true; // all
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6 mb-6 shadow-lg">
          <h1 className="text-3xl font-bold mb-2">👨‍💼 Admin Dashboard</h1>
          <p className="text-blue-100">Create and manage jobs in real-time</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div 
            className={`rounded-lg p-4 shadow cursor-pointer transition ${filter === 'all' ? 'bg-blue-200 border-2 border-blue-500' : 'bg-blue-100'}`}
            onClick={() => setFilter('all')}
          >
            <p className="text-gray-700 font-semibold">Total Jobs</p>
            <p className="text-3xl font-bold text-blue-600">{jobs.length}</p>
          </div>
          <div 
            className={`rounded-lg p-4 shadow cursor-pointer transition ${filter === 'pending' ? 'bg-yellow-200 border-2 border-yellow-500' : 'bg-yellow-100'}`}
            onClick={() => setFilter('pending')}
          >
            <p className="text-gray-700 font-semibold">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
          </div>
          <div 
            className={`rounded-lg p-4 shadow cursor-pointer transition ${filter === 'completed' ? 'bg-green-200 border-2 border-green-500' : 'bg-green-100'}`}
            onClick={() => setFilter('completed')}
          >
            <p className="text-gray-700 font-semibold">Completed</p>
            <p className="text-3xl font-bold text-green-600">{completedCount}</p>
          </div>
        </div>

        {/* Monthly Report */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Monthly Report</h2>
          <p className="text-gray-500 text-sm mb-4">Select a month to download a report of all jobs in that period.</p>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Select Month</label>
              <input
                type="month"
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => downloadReport('excel')}
                disabled={reportLoading.excel}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold px-5 py-2 rounded-lg transition shadow"
              >
                {reportLoading.excel ? (
                  <span>⏳ Generating…</span>
                ) : (
                  <span>⬇️ Download Excel</span>
                )}
              </button>
              <button
                onClick={() => downloadReport('pdf')}
                disabled={reportLoading.pdf}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold px-5 py-2 rounded-lg transition shadow"
              >
                {reportLoading.pdf ? (
                  <span>⏳ Generating…</span>
                ) : (
                  <span>⬇️ Download PDF</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Job Creation Form */}
        <JobForm
          onJobCreated={handleJobCreated}
          editingJob={editingJob}
          onJobUpdated={handleJobUpdated}
          onCancelEdit={handleCancelEdit}
        />


        {/* Jobs List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {filter === 'all' ? 'All Jobs' : filter === 'pending' ? 'Pending Jobs' : 'Completed Jobs'}
          </h2>

          {loading ? (
            <div className="text-center text-gray-600 py-8">⏳ Loading jobs...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center text-gray-600 py-8">
              {filter === 'all' ? 'No jobs yet. Create one!' : `No ${filter} jobs`}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  isWorker={false}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
