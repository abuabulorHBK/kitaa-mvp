'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { getAuthUser, logout } from '../../lib/auth'

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setUser(getAuthUser())
  }, [])

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gray-900 text-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">KITAA Admin</h1>
              <p className="text-sm text-gray-400">{user?.name}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm">Total Lounges</h3>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm">Active Lounges</h3>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm">Total Players</h3>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm">This Month Revenue</h3>
              <p className="text-3xl font-bold mt-2">0 TSh</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Lounges</h2>
            <p className="text-gray-600">No lounges yet...</p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
