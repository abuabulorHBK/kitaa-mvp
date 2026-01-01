export interface EloResult {
  player1EloAfter: number
  player2EloAfter: number
  player1Change: number
  player2Change: number
}

/**
 * Calculate ELO changes for a 2-player match
 * K-factor = 32 (standard for competitive gaming)
 */
export function calculateElo(
  player1EloBefore: number,
  player2EloBefore: number,
  result: 'player1_win' | 'player2_win' | 'draw'
): EloResult {
  const K = 32

  // Expected score for player 1
  const expectedPlayer1 = 1 / (1 + Math.pow(10, (player2EloBefore - player1EloBefore) / 400))
  
  // Expected score for player 2
  const expectedPlayer2 = 1 / (1 + Math.pow(10, (player1EloBefore - player2EloBefore) / 400))

  // Actual scores
  let actualPlayer1: number
  let actualPlayer2: number

  if (result === 'player1_win') {
    actualPlayer1 = 1
    actualPlayer2 = 0
  } else if (result === 'player2_win') {
    actualPlayer1 = 0
    actualPlayer2 = 1
  } else { // draw
    actualPlayer1 = 0.5
    actualPlayer2 = 0.5
  }

  // Calculate new ELOs
  const player1Change = Math.round(K * (actualPlayer1 - expectedPlayer1))
  const player2Change = Math.round(K * (actualPlayer2 - expectedPlayer2))

  return {
    player1EloAfter: player1EloBefore + player1Change,
    player2EloAfter: player2EloBefore + player2Change,
    player1Change,
    player2Change
  }
}