'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { getAuthUser, logout } from '@/lib/auth'
import PlayerStats from '@/components/PlayerStats'
import PlayerSessionHistory from '@/components/PlayerSessionHistory'
import Link from 'next/link'

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
                <h1 className="text-3xl font-bold">{user?.name}</h1>
                <p className="text-blue-100 text-sm">KITAA Player</p>
              </div>
              <div className="flex gap-3">
                <Link 
                  href="/leaderboard"
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                >
                  🏆 Leaderboard
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats - 2/3 width */}
            <div className="lg:col-span-2">
              {user?.id && <PlayerStats playerId={user.id} />}
            </div>

            {/* Recent Games - 1/3 width */}
            <div>
              {user?.id && <PlayerSessionHistory playerId={user.id} />}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}