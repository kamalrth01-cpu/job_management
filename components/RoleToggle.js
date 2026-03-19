'use client';

export default function RoleToggle({ currentRole, onRoleChange }) {
  return (
    <div className="flex gap-2 mb-6 justify-center">
      <button
        onClick={() => onRoleChange('admin')}
        className={`px-6 py-2 rounded-lg font-bold transition ${
          currentRole === 'admin'
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
        }`}
      >
        👨‍💼 Admin
      </button>
      <button
        onClick={() => onRoleChange('worker')}
        className={`px-6 py-2 rounded-lg font-bold transition ${
          currentRole === 'worker'
            ? 'bg-green-600 text-white shadow-lg'
            : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
        }`}
      >
        👷 Worker
      </button>
    </div>
  );
}
