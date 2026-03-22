"use client"

import { useAuth } from "@/lib/auth-context"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect after auth state has fully hydrated
    if (!loading && !user) {
      router.replace("/")
    }
  }, [user, loading, router])

  // Show a spinner while auth is loading — prevents the flash to login
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen w-full bg-background/50">
      <AppSidebar />
      <div className="flex w-full flex-col h-screen overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto bg-muted/20 w-full animate-in fade-in duration-500">
          <div className="p-2 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
