'use client';

import { useEffect, useState } from 'react';
import RoleToggle from '@/components/RoleToggle';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [role, setRole] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
    if (newRole === 'worker') {
      // Redirect immediately for worker
      router.push('/worker');
    }
  };

  const handleAdminLogin = () => {
    if (password === 'admin123') {
      router.push('/admin');
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">📋</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Job Management</h1>
        <p className="text-gray-600 mb-8">Real-time collaborative job tracking system</p>

        {!role ? (
          <div className="mb-6">
            <p className="text-gray-700 font-semibold mb-4">Select your role:</p>
            <RoleToggle currentRole={role} onRoleChange={handleRoleChange} />
          </div>
        ) : role === 'admin' ? (
          <div className="mb-6">
            <p className="text-gray-700 font-semibold mb-4">Admin Password:</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="Enter admin password"
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              onClick={handleAdminLogin}
              className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              Login as Admin
            </button>
            <button
              onClick={() => setRole(null)}
              className="w-full mt-2 bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-400 transition"
            >
              Back
            </button>
          </div>
        ) : null}

        {role === 'worker' && <p className="text-xs text-gray-500">Redirecting to worker dashboard...</p>}
      </div>
    </div>
  );
}
