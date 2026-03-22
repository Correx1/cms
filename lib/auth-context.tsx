"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export type Role = "admin" | "staff" | "client" | null

export interface User {
  id: string
  name: string
  email: string
  role: Role
  company?: string
  jobTitle?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function dashboardPath(role: string) {
  return `/dashboard/${role}`
}

/** Call /api/ensure-profile to create the row (bypasses RLS via service role) */
async function ensureProfile(name?: string, role?: string): Promise<void> {
  await fetch('/api/ensure-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, role }),
    credentials: 'include',
  })
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    // ── Helper: load profile from DB ──────────────────────────────────────────
    // Returns: User object if found, null if no row exists, 'error' if DB errored
    async function fetchProfile(userId: string, email: string): Promise<User | null | 'error'> {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        // PGRST116 = "no rows returned" — profile doesn't exist yet, safe to create
        if (error.code === 'PGRST116') return null
        // Any other error (e.g. 500 from recursive RLS) — don't trigger creation loop
        console.error('[auth] fetchProfile DB error:', error.code, error.message)
        return 'error'
      }

      if (!profile) return null

      return {
        id: userId,
        email,
        name: profile.name ?? email,
        role: profile.role,
        company: profile.company,
        jobTitle: profile.job_title,
      }
    }

    // ── On mount: hydrate session ─────────────────────────────────────────────
    async function initializeSession() {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const { id, email } = session.user
        let result = await fetchProfile(id, email ?? "")

        // Only attempt creation when the row simply doesn't exist (null)
        // Skip if there was a real DB error ('error') — avoids creation loops
        if (result === null) {
          await ensureProfile(
            session.user.user_metadata?.full_name ?? session.user.user_metadata?.name,
            session.user.user_metadata?.role
          )
          result = await fetchProfile(id, email ?? "")
        }

        const mapped = result !== 'error' ? result : null
        if (mounted && mapped) {
          setUser(mapped)
          // Already-authenticated user visiting login page → send to dashboard
          if (typeof window !== 'undefined' && window.location.pathname === '/') {
            router.replace(`/dashboard/${mapped.role}`)
          }
        }
      }

      if (mounted) setLoading(false)
    }

    initializeSession()

    // ── Auth state listener ───────────────────────────────────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null)
        router.push("/")
        return
      }

      if (event === "PASSWORD_RECOVERY") {
        router.push("/setup-password")
        return
      }

      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
        const { id, email } = session.user
        let result = await fetchProfile(id, email ?? "")

        // Only create profile if the row is genuinely missing (null), not on DB errors
        if (result === null) {
          await ensureProfile(
            session.user.user_metadata?.full_name ?? session.user.user_metadata?.name,
            session.user.user_metadata?.role
          )
          result = await fetchProfile(id, email ?? "")
        }

        const mapped = result !== 'error' ? result : null

        if (mapped) {
          setUser(mapped)
          if (event === "SIGNED_IN") {
            router.push(dashboardPath(mapped.role!))
          }
        } else if (result !== 'error' && event === "SIGNED_IN") {
          // Profile truly doesn't exist and couldn't be auto-created
          // (service role key needed — see .env.local)
          router.push("/setup-password")
        }
        // If result === 'error': DB is broken (run the SQL schema reset)
        // — don't redirect anywhere, user stays on current page
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
