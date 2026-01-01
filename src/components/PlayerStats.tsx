'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface GameStats {
  game_name: string
  current_elo: number
  peak_elo: number
  games_played: number
  wins: number
  losses: number
  draws: number
  win_rate: number
  total_paid: number
}

export default function PlayerStats({ playerId }: { playerId: string }) {
  const [stats, setStats] = useState<GameStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [playerId])

  async function loadStats() {
    const { data } = await supabase
      .from('player_game_stats')
      .select(`
        current_elo,
        peak_elo,
        games_played,
        wins,
        losses,
        draws,
        total_paid_as_loser,
        games_catalog!inner(name)
      `)
      .eq('player_id', playerId)
      .gte('games_played', 1)

    if (data) {
      const formatted: GameStats[] = data.map((stat: any) => ({
        game_name: stat.games_catalog.name,
        current_elo: stat.current_elo,
        peak_elo: stat.peak_elo,
        games_played: stat.games_played,
        wins: stat.wins,
        losses: stat.losses,
        draws: stat.draws,
        win_rate: stat.games_played > 0 ? Math.round((stat.wins / stat.games_played) * 100) : 0,
        total_paid: stat.total_paid_as_loser
      }))
      setStats(formatted)
    }

    setLoading(false)
  }

  if (loading) {
    return <div className="text-gray-600">Loading stats...</div>
  }

  if (stats.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">My Stats</h2>
        <p className="text-gray-600">No games played yet. Start playing to build your stats!</p>
      </div>
    )
  }

  const totalSpent = stats.reduce((sum, s) => sum + s.total_paid, 0)
  const totalGames = stats.reduce((sum, s) => sum + s.games_played, 0)
  const totalWins = stats.reduce((sum, s) => sum + s.wins, 0)
  const overallWinRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Overall Performance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Games</p>
            <p className="text-3xl font-bold text-blue-600">{totalGames}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Wins</p>
            <p className="text-3xl font-bold text-green-600">{totalWins}</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Win Rate</p>
            <p className="text-3xl font-bold text-purple-600">{overallWinRate}%</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Spent</p>
            <p className="text-2xl font-bold text-red-600">{totalSpent.toLocaleString()} TSh</p>
          </div>
        </div>
      </div>

      {/* Per-Game Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Stats by Game</h2>
        <div className="space-y-4">
          {stats.map((stat) => (
            <div key={stat.game_name} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold">{stat.game_name}</h3>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Current ELO</p>
                  <p className="text-2xl font-bold text-blue-600">{stat.current_elo}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Peak ELO</p>
                  <p className="font-semibold">{stat.peak_elo}</p>
                </div>
                <div>
                  <p className="text-gray-600">Games</p>
                  <p className="font-semibold">{stat.games_played}</p>
                </div>
                <div>
                  <p className="text-gray-600">Wins</p>
                  <p className="font-semibold text-green-600">{stat.wins}</p>
                </div>
                <div>
                  <p className="text-gray-600">Losses</p>
                  <p className="font-semibold text-red-600">{stat.losses}</p>
                </div>
                <div>
                  <p className="text-gray-600">Win Rate</p>
                  <p className="font-semibold">{stat.win_rate}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Spent</p>
                  <p className="font-semibold">{stat.total_paid.toLocaleString()} TSh</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}