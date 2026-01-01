'use client'


import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import { getAuthUser, logout } from '@/lib/auth'
import RecordSessionForm from '@/components/RecordSessionForm'
import SessionHistory from '@/components/SessionHistory'
import AddPlayerForm from '@/components/AddPlayerForm'
import { supabase } from '@/lib/supabase'

export default function GMDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    todaySessions: 0,
    todayRevenue: 0,
    totalPlayers: 0
  })
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const authUser = getAuthUser()
    setUser(authUser)
    
    if (authUser?.lounge_id) {
      loadStats(authUser.lounge_id)
    }
  }, [refreshKey])

  async function loadStats(loungeId: string) {
    const { data: lounge } = await supabase
      .from('lounges')
      .select('total_sessions_count, total_session_revenue')
      .eq('id', loungeId)
      .single()

    const { count: playerCount } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('lounge_id', loungeId)
      .eq('active', true)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { data: todaySessions } = await supabase
      .from('sessions')
      .select('session_fee_charged')
      .eq('lounge_id', loungeId)
      .gte('played_at', today.toISOString())

    const todayRevenue = todaySessions?.reduce((sum, s) => sum + s.session_fee_charged, 0) || 0

    setStats({
      todaySessions: todaySessions?.length || 0,
      todayRevenue,
      totalPlayers: playerCount || 0
    })
  }

  function handlePlayerAdded() {
    setRefreshKey(prev => prev + 1)
    alert('Player added successfully!')
  }

  return (
    <ProtectedRoute allowedRoles={['game_master']}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">KITAA Game Master</h1>
              <p className="text-sm text-gray-600">{user?.name}</p>
            </div>
            <div className="flex gap-3">
              <Link 
                href="/leaderboard"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                🏆 Leaderboard
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-medium">Today's Sessions</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todaySessions}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-medium">Today's Revenue</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todayRevenue.toLocaleString()} TSh</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-600 text-sm font-medium">Total Players</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPlayers}</p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Record Session */}
            {user?.lounge_id && (
              <RecordSessionForm loungeId={user.lounge_id} />
            )}

            {/* Add Player */}
            {user?.lounge_id && (
              <AddPlayerForm 
                loungeId={user.lounge_id} 
                onPlayerAdded={handlePlayerAdded}
              />
            )}
          </div>

          {/* Session History */}
          {user?.lounge_id && (
            <SessionHistory loungeId={user.lounge_id} />
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}