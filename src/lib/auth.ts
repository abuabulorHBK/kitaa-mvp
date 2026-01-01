import { supabase } from './supabase'

export type UserRole = 'admin' | 'game_master' | 'player'

export interface AuthUser {
  id: string
  phone: string
  role: UserRole
  name: string
  lounge_id?: string
}

export async function loginWithPhone(phone: string, password: string): Promise<AuthUser | null> {
  try {
    console.log('🔍 Attempting login with phone:', phone)
    
    // Try admin first
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('phone', phone)
      .eq('active', true)
      .single()
    
    console.log('Admin query result:', { admin, adminError })
    
    if (admin && password === 'admin123') {
      console.log('✅ Admin login successful')
      return {
        id: admin.id,
        phone: admin.phone,
        role: 'admin',
        name: admin.name
      }
    }

    // Try game master
    const { data: gm, error: gmError } = await supabase
      .from('game_masters')
      .select('*')
      .eq('phone', phone)
      .eq('active', true)
      .single()
    
    console.log('GM query result:', { gm, gmError })
    
    if (gm && password === 'gm123') {
      console.log('✅ GM login successful')
      return {
        id: gm.id,
        phone: gm.phone,
        role: 'game_master',
        name: gm.name,
        lounge_id: gm.lounge_id
      }
    }

    // Try player
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('*')
      .eq('phone', phone)
      .eq('active', true)
      .single()
    
    console.log('Player query result:', { player, playerError })
    
    if (player && password === 'player123') {
      console.log('✅ Player login successful')
      return {
        id: player.id,
        phone: player.phone,
        role: 'player',
        name: player.display_name,
        lounge_id: player.lounge_id
      }
    }

    console.log('❌ No matching user found or wrong password')
    return null
  } catch (error) {
    console.error('❌ Login error:', error)
    return null
  }
}

export function saveAuthUser(user: AuthUser) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kitaa_user', JSON.stringify(user))
  }
}

export function getAuthUser(): AuthUser | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('kitaa_user')
    return stored ? JSON.parse(stored) : null
  }
  return null
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('kitaa_user')
    window.location.href = '/login'
  }
}