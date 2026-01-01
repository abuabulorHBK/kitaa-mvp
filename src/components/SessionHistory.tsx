'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Session {
  id: string
  played_at: string
  game_name: string
  player1_name: string
  player2_name: string
  player_1_score: number
  player_2_score: number
  winner_name: string | null
  session_fee_charged: number
  player_1_elo_change: number
  player_2_elo_change: number
}

export default function SessionHistory({ loungeId }: { loungeId: string }) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSessions()
  }, [loungeId])

  async function loadSessions() {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        id,
        played_at,
        player_1_score,
        player_2_score,
        session_fee_charged,
        player_1_elo_change,
        player_2_elo_change,
        games_catalog!inner(name),
        player1:player_1_id(display_name),
        player2:player_2_id(display_name),
        winner:winner_id(display_name)
      `)
      .eq('lounge_id', loungeId)
      .order('played_at', { ascending: false })
      .limit(10)

    if (data) {
      const formatted = data.map((s: any) => ({
        id: s.id,
        played_at: s.played_at,
        game_name: s.games_catalog.name,
        player1_name: s.player1.display_name,
        player2_name: s.player2.display_name,
        player_1_score: s.player_1_score,
        player_2_score: s.player_2_score,
        winner_name: s.winner?.display_name || 'Draw',
        session_fee_charged: s.session_fee_charged,
        player_1_elo_change: s.player_1_elo_change,
        player_2_elo_change: s.player_2_elo_change
      }))
      setSessions(formatted)
    }

    setLoading(false)
  }

  if (loading) {
    return <div className="text-gray-600">Loading sessions...</div>
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Sessions</h2>
        <p className="text-gray-600">No sessions recorded yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Recent Sessions</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b">
            <tr className="text-left text-sm text-gray-600">
              <th className="pb-2">Time</th>
              <th className="pb-2">Game</th>
              <th className="pb-2">Players</th>
              <th className="pb-2">Score</th>
              <th className="pb-2">Winner</th>
              <th className="pb-2">Revenue</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {sessions.map((session) => (
              <tr key={session.id} className="border-b hover:bg-gray-50">
                <td className="py-3">
                  {new Date(session.played_at).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </td>
                <td className="py-3">{session.game_name}</td>
                <td className="py-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span>{session.player1_name}</span>
                      <span className={`text-xs ${session.player_1_elo_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ({session.player_1_elo_change >= 0 ? '+' : ''}{session.player_1_elo_change})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{session.player2_name}</span>
                      <span className={`text-xs ${session.player_2_elo_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ({session.player_2_elo_change >= 0 ? '+' : ''}{session.player_2_elo_change})
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3 font-mono">
                  {session.player_1_score} - {session.player_2_score}
                </td>
                <td className="py-3 font-semibold">{session.winner_name}</td>
                <td className="py-3">{session.session_fee_charged} TSh</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}