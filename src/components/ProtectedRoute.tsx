'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthUser, UserRole } from '@/lib/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const user = getAuthUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    if (!allowedRoles.includes(user.role)) {
      router.push('/login')
      return
    }

    setAuthorized(true)
  }, [allowedRoles, router])

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return <>{children}</>
}
