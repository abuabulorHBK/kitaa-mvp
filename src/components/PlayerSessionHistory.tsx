'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface PlayerSession {
  id: string
  played_at: string
  game_name: string
  opponent_name: string
  player_score: number
  opponent_score: number
  result: 'won' | 'lost' | 'draw'
  elo_change: number
  paid: number
}

export default function PlayerSessionHistory({ playerId }: { playerId: string }) {
  const [sessions, setSessions] = useState<PlayerSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSessions()
  }, [playerId])

  async function loadSessions() {
    const { data } = await supabase
      .from('sessions')
      .select(`
        id,
        played_at,
        player_1_id,
        player_2_id,
        player_1_score,
        player_2_score,
        winner_id,
        player_1_elo_change,
        player_2_elo_change,
        session_fee_charged,
        loser_id,
        games_catalog!inner(name),
        player1:player_1_id(display_name),
        player2:player_2_id(display_name)
      `)
      .or(`player_1_id.eq.${playerId},player_2_id.eq.${playerId}`)
      .order('played_at', { ascending: false })
      .limit(20)

    if (data) {
      const formatted: PlayerSession[] = data.map((s: any) => {
        const isPlayer1 = s.player_1_id === playerId
        const opponentName = isPlayer1 ? s.player2.display_name : s.player1.display_name
        const playerScore = isPlayer1 ? s.player_1_score : s.player_2_score
        const opponentScore = isPlayer1 ? s.player_2_score : s.player_1_score
        const eloChange = isPlayer1 ? s.player_1_elo_change : s.player_2_elo_change
        
        let result: 'won' | 'lost' | 'draw'
        if (!s.winner_id) {
          result = 'draw'
        } else if (s.winner_id === playerId) {
          result = 'won'
        } else {
          result = 'lost'
        }

        const paid = s.loser_id === playerId ? s.session_fee_charged : 0

        return {
          id: s.id,
          played_at: s.played_at,
          game_name: s.games_catalog.name,
          opponent_name: opponentName,
          player_score: playerScore,
          opponent_score: opponentScore,
          result,
          elo_change: eloChange,
          paid
        }
      })

      setSessions(formatted)
    }

    setLoading(false)
  }

  if (loading) {
    return <div className="text-gray-600">Loading history...</div>
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Games</h2>
        <p className="text-gray-600">No games played yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Recent Games</h2>
      <div className="space-y-3">
        {sessions.map((session) => (
          <div 
            key={session.id}
            className={`border-l-4 p-4 rounded-lg ${
              session.result === 'won' ? 'border-green-500 bg-green-50' :
              session.result === 'lost' ? 'border-red-500 bg-red-50' :
              'border-gray-400 bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900">{session.game_name}</p>
                <p className="text-sm text-gray-600">
                  vs {session.opponent_name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(session.played_at).toLocaleString()}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {session.player_score} - {session.opponent_score}
                </p>
                <p className={`text-sm font-semibold ${
                  session.result === 'won' ? 'text-green-600' :
                  session.result === 'lost' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {session.result.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-3 pt-3 border-t">
              <div className="flex items-center gap-4 text-sm">
                <span className={session.elo_change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  ELO: {session.elo_change >= 0 ? '+' : ''}{session.elo_change}
                </span>
                {session.paid > 0 && (
                  <span className="text-red-600">
                    Paid: {session.paid.toLocaleString()} TSh
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}