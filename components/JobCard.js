'use client';

export default function JobCard({ job, onComplete, onEdit, onDelete, isWorker = false }) {
  const handleComplete = async () => {
    if (window.confirm('Mark this job as completed?')) {
      try {
        const response = await fetch(`/api/jobs/${job._id}/complete`, {
          method: 'PUT',
        });
        const data = await response.json();
        if (data.success && onComplete) {
          onComplete(data.data);
        }
      } catch (error) {
        alert('Error marking job as completed');
        console.error(error);
      }
    }
  };

  const handleEdit = () => {
    if (onEdit) onEdit(job);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/jobs/${job._id}`, {
          method: 'DELETE',
          headers: { 'x-role': 'admin' },
        });
        const data = await response.json();
        if (data.success && onDelete) {
          onDelete(job._id);
        } else {
          alert('Error deleting job');
        }
      } catch (error) {
        alert('Error deleting job');
        console.error(error);
      }
    }
  };

  const statusColor = job.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  const statusText = job.status === 'completed' ? '✓ Completed' : '⏳ Pending';

  return (
    <div className="border border-gray-300 rounded-lg p-4 mb-4 bg-white shadow-md hover:shadow-lg transition">
      {/* Job Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
          <p className="text-sm text-gray-600">Job #: {job.jobNumber}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
          {statusText}
        </span>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs text-gray-500 font-semibold">MATERIAL</p>
          <p className="text-gray-800">{job.material}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-semibold">CREATED</p>
          <p className="text-gray-800">{new Date(job.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 font-semibold">DESCRIPTION</p>
        <p className="text-gray-700">{job.description}</p>
      </div>

      {/* Files */}
      {job.files && job.files.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 font-semibold mb-2">ATTACHMENTS</p>
          <div className="flex flex-wrap gap-2">
            {job.files.map((file, idx) => (
              <a
                key={idx}
                href={file}
                download
                className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition"
              >
                📎 {file.split('/').pop()}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isWorker && job.status === 'pending' && (
        <button
          onClick={handleComplete}
          className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition"
        >
          ✓ Mark as Completed
        </button>
      )}

      {!isWorker && (
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition"
          >
            ✏️ Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition"
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
}
