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

// Derive the dashboard path for a given role
function dashboardPath(role: string) {
  return `/dashboard/${role}`
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    // ── Helper: load profile and return a mapped User object ──────────────────
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

    // ── On mount: hydrate from existing session ────────────────────────────────
    async function initializeSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        const mapped = await fetchProfile(session.user.id, session.user.email ?? "")
        if (mounted && mapped) setUser(mapped)
      }

      if (mounted) setLoading(false)
    }

    initializeSession()

    // ── React to all future auth state changes ─────────────────────────────────
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null)
        router.push("/")
        return
      }

      // PASSWORD_RECOVERY: user clicked a "reset password" link — send to setup-password
      if (event === "PASSWORD_RECOVERY") {
        router.push("/setup-password")
        return
      }

      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
        const mapped = await fetchProfile(session.user.id, session.user.email ?? "")

        if (mapped) {
          setUser(mapped)
          // Only hard-navigate on an actual sign-in, not a silent token refresh
          if (event === "SIGNED_IN") {
            router.push(dashboardPath(mapped.role!))
          }
        } else {
          // Profile row doesn't exist yet (e.g. manually created Supabase user)
          // Send them to set up their password / profile first
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
      {/* Render children immediately — individual pages handle their own loading state */}
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
