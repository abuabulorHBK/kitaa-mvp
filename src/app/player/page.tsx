'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { getAuthUser, logout } from '@/lib/auth'

export default function PlayerDashboard() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setUser(getAuthUser())
  }, [])

  return (
    <ProtectedRoute allowedRoles={['player']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">{user?.name}</h1>
                <p className="text-blue-100 text-sm">KITAA Player</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">My Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Current ELO</p>
                <p className="text-2xl font-bold">1000</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Games Played</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Win Rate</p>
                <p className="text-2xl font-bold">0%</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Spent</p>
                <p className="text-2xl font-bold">0 TSh</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
            <p className="text-gray-600">Coming soon...</p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
