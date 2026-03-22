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
    async function fetchProfile(userId: string, email: string): Promise<User | null> {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

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
        let mapped = await fetchProfile(id, email ?? "")

        if (!mapped) {
          // Profile is missing — try to auto-create it via server API
          await ensureProfile(
            session.user.user_metadata?.full_name ?? session.user.user_metadata?.name,
            session.user.user_metadata?.role
          )
          mapped = await fetchProfile(id, email ?? "")
        }

        if (mounted && mapped) {
          setUser(mapped)
          // If the user is on the login page with an active session, redirect them
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
        let mapped = await fetchProfile(id, email ?? "")

        if (!mapped) {
          // Profile row is missing — create it via server API (bypasses RLS)
          await ensureProfile(
            session.user.user_metadata?.full_name ?? session.user.user_metadata?.name,
            session.user.user_metadata?.role
          )
          // Re-fetch after creation
          mapped = await fetchProfile(id, email ?? "")
        }

        if (mapped) {
          setUser(mapped)
          if (event === "SIGNED_IN") {
            router.push(dashboardPath(mapped.role!))
          }
        } else {
          // Profile could not be created (service role key missing, SQL not run)
          // Redirect to setup-password so user can at least set a password;
          // the setup-password page also calls ensure-profile before redirecting
          if (event === "SIGNED_IN") {
            router.push("/setup-password")
          }
        }
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
