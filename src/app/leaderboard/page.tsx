'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface LeaderboardEntry {
  rank: number
  player_name: string
  lounge_name: string
  current_elo: number
  games_played: number
  wins: number
  losses: number
  win_rate: number
}

export default function LeaderboardPage() {
  const [selectedGame, setSelectedGame] = useState('')
  const [games, setGames] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGames()
  }, [])

  useEffect(() => {
    if (selectedGame) {
      loadLeaderboard(selectedGame)
    }
  }, [selectedGame])

  async function loadGames() {
    const { data } = await supabase
      .from('games_catalog')
      .select('*')
      .eq('active', true)
    
    if (data && data.length > 0) {
      setGames(data)
      setSelectedGame(data[0].id)
    }
    setLoading(false)
  }

  async function loadLeaderboard(gameId: string) {
    setLoading(true)
    
    const { data } = await supabase
      .from('player_game_stats')
      .select(`
        current_elo,
        games_played,
        wins,
        losses,
        players!inner(display_name, lounges!inner(name))
      `)
      .eq('game_id', gameId)
      .gte('games_played', 1)
      .order('current_elo', { ascending: false })
      .limit(50)

    if (data) {
      const formatted: LeaderboardEntry[] = data.map((entry: any, index: number) => ({
        rank: index + 1,
        player_name: entry.players.display_name,
        lounge_name: entry.players.lounges.name,
        current_elo: entry.current_elo,
        games_played: entry.games_played,
        wins: entry.wins,
        losses: entry.losses,
        win_rate: entry.games_played > 0 ? Math.round((entry.wins / entry.games_played) * 100) : 0
      }))
      
      setLeaderboard(formatted)
    }
    
    setLoading(false)
  }

  const selectedGameName = games.find(g => g.id === selectedGame)?.name || ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white">KITAA Leaderboard</h1>
          <p className="text-blue-100">Tanzania Gaming Network</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Game Selector */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Game
          </label>
          <div className="flex gap-2 flex-wrap">
            {games.map(game => (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  selectedGame === game.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {game.name}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">{selectedGameName} Rankings</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-600">Loading...</div>
          ) : leaderboard.length === 0 ? (
            <div className="p-12 text-center text-gray-600">No players yet. Start playing!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Player</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Lounge</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">ELO</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Games</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">W-L</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Win %</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => (
                    <tr 
                      key={entry.rank}
                      className={`border-b hover:bg-blue-50 transition ${
                        entry.rank <= 3 ? 'bg-yellow-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {entry.rank === 1 && <span className="text-2xl">🥇</span>}
                          {entry.rank === 2 && <span className="text-2xl">🥈</span>}
                          {entry.rank === 3 && <span className="text-2xl">🥉</span>}
                          <span className="font-bold text-lg">{entry.rank}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{entry.player_name}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{entry.lounge_name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full font-bold">
                          {entry.current_elo}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-700">{entry.games_played}</td>
                      <td className="px-6 py-4 text-center text-gray-700">
                        {entry.wins}-{entry.losses}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-semibold ${
                          entry.win_rate >= 60 ? 'text-green-600' :
                          entry.win_rate >= 40 ? 'text-blue-600' :
                          'text-gray-600'
                        }`}>
                          {entry.win_rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <a href="/login" className="text-white hover:text-blue-200 font-semibold">
            ← Back to Login
          </a>
        </div>
      </main>
    </div>
  )
}