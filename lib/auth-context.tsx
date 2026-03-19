"use client"

import React, { createContext, useContext, useState } from "react"
import { useRouter } from "next/navigation"

export type Role = "admin" | "staff" | "client" | null

interface User {
  id: string
  name: string
  email: string
  role: Role
}

interface AuthContextType {
  user: User | null
  login: (email: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  const login = (email: string) => {
    // Mock login logic based on email to test different roles
    let role: Role = "client"
    let name = "Alice Johnson"
    let id = "c1" // Maps to TechCorp Inc.

    if (email.includes("admin")) {
      role = "admin"
      name = "Sarah Admin"
      id = "s1"
    } else if (email.includes("staff")) {
      role = "staff"
      name = "Mike Developer"
      id = "s2" // Maps to active mockStaff assignments
    }

    const mockUser = { id, name, email, role }
    setUser(mockUser)
    
    // Redirect based on role
    router.push(`/dashboard/${role}`)
  }

  const logout = () => {
    setUser(null)
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
