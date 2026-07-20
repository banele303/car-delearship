"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useMutation } from "convex/react"
import { api } from "@/../convex/_generated/api"

type AuthUser = { id: string; email: string; name: string; role: string } | null

type AuthContextType = {
  user: AuthUser
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: () => {},
})

export function useConvexAuth() {
  return useContext(AuthContext)
}

export default function ConvexAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null)
  const [loading, setLoading] = useState(true)
  const signInMutation = useMutation(api.auth.signIn)
  const signUpMutation = useMutation(api.auth.signUp)
  const signOutMutation = useMutation(api.auth.signOut)

  // Check stored token on mount
  useEffect(() => {
    const stored = localStorage.getItem("convex_token")
    if (stored) {
      try {
        fetch("/api/auth/me", {
          headers: { authorization: `Bearer ${stored}` },
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data?.user) setUser(data.user)
          })
          .finally(() => setLoading(false))
      } catch {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await signInMutation({ email, password })
    localStorage.setItem("convex_token", result.token)
    setUser(result.user as AuthUser)
  }, [signInMutation])

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    await signUpMutation({ email, password, name })
    // Auto sign-in after signup
    const result = await signInMutation({ email, password })
    localStorage.setItem("convex_token", result.token)
    setUser(result.user as AuthUser)
  }, [signUpMutation, signInMutation])

  const signOut = useCallback(() => {
    const token = localStorage.getItem("convex_token")
    if (token) signOutMutation({ token })
    localStorage.removeItem("convex_token")
    setUser(null)
  }, [signOutMutation])

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
