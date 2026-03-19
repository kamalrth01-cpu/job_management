'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function JobForm({ onJobCreated, editingJob, onJobUpdated, onCancelEdit }) {
  const [formData, setFormData] = useState({
    title: '',
    jobNumber: '',
    material: '',
    description: '',
  });
  const [files, setFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [removedFiles, setRemovedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (editingJob) {
      setFormData({
        title: editingJob.title || '',
        jobNumber: editingJob.jobNumber || '',
        material: editingJob.material || '',
        description: editingJob.description || '',
      });
      setExistingFiles(editingJob.files || []);
      setRemovedFiles([]);
      setFiles([]);
      setError('');
      setSuccess('');
    } else {
      setFormData({ title: '', material: '', description: '' });
      setExistingFiles([]);
      setRemovedFiles([]);
      setFiles([]);
      setError('');
      setSuccess('');
    }
  }, [editingJob]);

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const form = new FormData();
      form.append('title', formData.title);
      if (editingJob) {
        form.append('jobNumber', formData.jobNumber);
      }
      form.append('material', formData.material);
      form.append('description', formData.description);

      // Append removed files for update
      if (editingJob && removedFiles.length > 0) {
        form.append('removeFiles', JSON.stringify(removedFiles));
      }

      // Append all new files
      files.forEach((file) => {
        form.append('files', file);
      });

      let response;
      if (editingJob) {
        response = await axios.put(`/api/jobs/${editingJob._id}`, form, {
          headers: { 'Content-Type': 'multipart/form-data', 'x-role': 'admin' },
        });
        setSuccess('✓ Job updated successfully!');
        if (onJobUpdated) {
          onJobUpdated(response.data.data);
        }
      } else {
        response = await axios.post('/api/jobs', form, {
          headers: { 'Content-Type': 'multipart/form-data', 'x-role': 'admin' },
        });
        setSuccess('✓ Job created successfully!');
        setFormData({ title: '', jobNumber: '', material: '', description: '' });
        setFiles([]);
        if (onJobCreated) {
          onJobCreated(response.data.data);
        }
      }
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setError(`✗ Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {editingJob ? 'Edit Job' : 'Create New Job'}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg font-semibold">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg font-semibold">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Job Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Job Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter job title"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Job Number - Only show for editing */}
        {editingJob && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Job Number (Auto-generated)
            </label>
            <input
              type="text"
              name="jobNumber"
              value={formData.jobNumber}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>
        )}

        {/* Material */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Material *
          </label>
          <input
            type="text"
            name="material"
            value={formData.material}
            onChange={handleInputChange}
            placeholder="e.g., Steel, Wood, Plastic"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter detailed job description"
          required
          rows="4"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Attach Files (Optional)
        </label>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {files.length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 font-semibold mb-2">New files to upload:</p>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {files.map((file, idx) => (
                <li key={idx}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Existing Files (for editing) */}
      {editingJob && existingFiles.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Existing Files
          </label>
          <div className="space-y-2">
            {existingFiles.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <a
                  href={file}
                  download
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  📎 {file.split('/').pop()}
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setRemovedFiles(prev => [...prev, file]);
                    setExistingFiles(prev => prev.filter(f => f !== file));
                  }}
                  className="text-red-600 hover:text-red-800 text-sm font-semibold"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {loading ? '⏳ Saving...' : (editingJob ? '✓ Update Job' : '✓ Create Job')}
        </button>
        {editingJob && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="flex-1 bg-gray-600 text-white font-bold py-3 rounded-lg hover:bg-gray-700 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
