'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'
import { calculateElo } from '@/lib/elo'

interface Game {
  id: string
  name: string
  game_type: string
}

interface Player {
  id: string
  display_name: string
}

export default function RecordSessionForm({ loungeId }: { loungeId: string }) {
  const [games, setGames] = useState<Game[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Form state
  const [selectedGame, setSelectedGame] = useState('')
  const [player1Id, setPlayer1Id] = useState('')
  const [player2Id, setPlayer2Id] = useState('')
  const [player1Score, setPlayer1Score] = useState('')
  const [player2Score, setPlayer2Score] = useState('')
  const [sessionFee, setSessionFee] = useState('500')

  // Preview state
  const [preview, setPreview] = useState<any>(null)

  useEffect(() => {
    loadGamesAndPlayers()
  }, [])

  async function loadGamesAndPlayers() {
    // Load games
    const { data: gamesData } = await supabase
      .from('games_catalog')
      .select('*')
      .eq('active', true)
    
    if (gamesData) setGames(gamesData)

    // Load players for this lounge
    const { data: playersData } = await supabase
      .from('players')
      .select('id, display_name')
      .eq('lounge_id', loungeId)
      .eq('active', true)
    
    if (playersData) setPlayers(playersData)
  }

  // Calculate preview when inputs change
  useEffect(() => {
    if (selectedGame && player1Id && player2Id && player1Score && player2Score) {
      generatePreview()
    } else {
      setPreview(null)
    }
  }, [selectedGame, player1Id, player2Id, player1Score, player2Score, sessionFee])

  async function generatePreview() {
    // Get current ELOs for both players
    const { data: p1Stats } = await supabase
      .from('player_game_stats')
      .select('current_elo')
      .eq('player_id', player1Id)
      .eq('game_id', selectedGame)
      .single()

    const { data: p2Stats } = await supabase
      .from('player_game_stats')
      .select('current_elo')
      .eq('player_id', player2Id)
      .eq('game_id', selectedGame)
      .single()

    const p1Elo = p1Stats?.current_elo || 1000
    const p2Elo = p2Stats?.current_elo || 1000

    // Determine winner
    const score1 = parseInt(player1Score)
    const score2 = parseInt(player2Score)
    
    let result: 'player1_win' | 'player2_win' | 'draw_split_cost'
    let winnerId: string | null
    let loserId: string | null

    if (score1 > score2) {
      result = 'player1_win'
      winnerId = player1Id
      loserId = player2Id
    } else if (score2 > score1) {
      result = 'player2_win'
      winnerId = player2Id
      loserId = player1Id
    } else {
      result = 'draw_split_cost'
      winnerId = null
      loserId = null
    }

    // Calculate ELO changes
    const eloResult = calculateElo(p1Elo, p2Elo, result === 'player1_win' ? 'player1_win' : result === 'player2_win' ? 'player2_win' : 'draw')

    // Calculate financials
    const fee = parseFloat(sessionFee)
    const kitaaCut = fee * 0.10

    setPreview({
      p1EloBefore: p1Elo,
      p2EloBefore: p2Elo,
      eloResult,
      winnerId,
      loserId,
      result,
      fee,
      kitaaCut
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!preview) return

    setLoading(true)
    const user = getAuthUser()

    const sessionData = {
      lounge_id: loungeId,
      game_id: selectedGame,
      player_1_id: player1Id,
      player_2_id: player2Id,
      player_1_score: parseInt(player1Score),
      player_2_score: parseInt(player2Score),
      result: preview.result,
      winner_id: preview.winnerId,
      loser_id: preview.loserId,
      player_1_elo_before: preview.p1EloBefore,
      player_2_elo_before: preview.p2EloBefore,
      player_1_elo_after: preview.eloResult.player1EloAfter,
      player_2_elo_after: preview.eloResult.player2EloAfter,
      player_1_elo_change: preview.eloResult.player1Change,
      player_2_elo_change: preview.eloResult.player2Change,
      session_fee_charged: preview.fee,
      kitaa_cut_percentage: 10.00,
      kitaa_cut_amount: preview.kitaaCut,
      recorded_by_gm_id: user?.id
    }

    console.log('Attempting to insert session:', sessionData)

    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert(sessionData)
        .select()

      console.log('Insert response:', { data, error })

      if (error) {
        console.error('Error message:', error.message)
        console.error('Error code:', error.code)
        console.error('Error details:', error.details)
        console.error('Error hint:', error.hint)
        throw error
      }

      console.log('✅ Session recorded successfully!')
      setSuccess(true)
      
      // Reset form
      setTimeout(() => {
        setPlayer1Id('')
        setPlayer2Id('')
        setPlayer1Score('')
        setPlayer2Score('')
        setSuccess(false)
        setPreview(null)
      }, 2000)

    } catch (error: any) {
      console.error('Catch block error:', error)
      alert(`Failed to record session: ${error?.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const player1 = players.find(p => p.id === player1Id)
  const player2 = players.find(p => p.id === player2Id)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Record Session</h2>

      {players.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4">
          No players found. Add players first before recording sessions.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Game Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Game
          </label>
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select game...</option>
            {games.map(game => (
              <option key={game.id} value={game.id}>{game.name}</option>
            ))}
          </select>
        </div>

        {/* Player Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player 1
            </label>
            <select
              value={player1Id}
              onChange={(e) => setPlayer1Id(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select player...</option>
              {players.filter(p => p.id !== player2Id).map(player => (
                <option key={player.id} value={player.id}>{player.display_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player 2
            </label>
            <select
              value={player2Id}
              onChange={(e) => setPlayer2Id(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select player...</option>
              {players.filter(p => p.id !== player1Id).map(player => (
                <option key={player.id} value={player.id}>{player.display_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {player1?.display_name || 'Player 1'} Score
            </label>
            <input
              type="number"
              value={player1Score}
              onChange={(e) => setPlayer1Score(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {player2?.display_name || 'Player 2'} Score
            </label>
            <input
              type="number"
              value={player2Score}
              onChange={(e) => setPlayer2Score(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="0"
              required
            />
          </div>
        </div>

        {/* Session Fee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Fee (TSh)
          </label>
          <input
            type="number"
            value={sessionFee}
            onChange={(e) => setSessionFee(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="0"
            step="100"
            required
          />
        </div>

        {/* Preview */}
        {preview && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold mb-3">Preview:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{player1?.display_name}:</span>
                <span className="font-mono">
                  {preview.p1EloBefore} → {preview.eloResult.player1EloAfter} 
                  <span className={preview.eloResult.player1Change >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {' '}({preview.eloResult.player1Change >= 0 ? '+' : ''}{preview.eloResult.player1Change})
                  </span>
                </span>
              </div>
              <div className="flex justify-between">
                <span>{player2?.display_name}:</span>
                <span className="font-mono">
                  {preview.p2EloBefore} → {preview.eloResult.player2EloAfter}
                  <span className={preview.eloResult.player2Change >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {' '}({preview.eloResult.player2Change >= 0 ? '+' : ''}{preview.eloResult.player2Change})
                  </span>
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Result:</span>
                <span>
                  {preview.result === 'draw_split_cost' ? 'DRAW' : 
                   preview.winnerId === player1Id ? `${player1?.display_name} WINS` : `${player2?.display_name} WINS`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Loser pays:</span>
                <span>{preview.fee.toLocaleString()} TSh</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>KITAA cut (10%):</span>
                <span>{preview.kitaaCut.toLocaleString()} TSh</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !preview || players.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Recording...' : success ? '✓ Session Recorded!' : 'Record Session'}
        </button>
      </form>
    </div>
  )
}