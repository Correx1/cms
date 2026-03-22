"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Loader2 } from "lucide-react"

export default function SetupPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [success, setSuccess] = useState(false)

  // Guard: if no active session, push back to login
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace("/")
    })
  }, [supabase, router])

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.")
      setLoading(false)
      return
    }

    // 1️⃣ Update the password in auth.users
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setErrorMsg(updateError.message)
      setLoading(false)
      return
    }

    // 2️⃣ Get current user (guaranteed to be set since we called updateUser)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // 3️⃣ Upsert the profiles row — this is the critical step that was missing.
      //    ON CONFLICT (id) DO NOTHING means we never overwrite an existing role.
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: user.email ?? "",
            name:
              (user.user_metadata?.full_name as string | undefined) ??
              (user.email?.split("@")[0] ?? "User"),
            role: (user.user_metadata?.role as string | undefined) ?? "client",
          },
          { onConflict: "id", ignoreDuplicates: true }
        )

      if (profileError) {
        // Non-fatal: profile may already exist. Log but continue.
        console.warn("Profile upsert warning:", profileError.message)
      }
    }

    // 4️⃣ Sign out so they complete a clean login which triggers the dashboard redirect
    await supabase.auth.signOut()

    setSuccess(true)
    setTimeout(() => router.replace("/"), 2000)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8 md:p-8">
      <div className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2">
        <Image src="/logo.png" alt="Agency CRM" width={40} height={40} className="w-10 h-10 object-contain" />
      </div>

      <div className="w-full max-w-sm sm:max-w-md animate-in fade-in zoom-in duration-500 flex flex-col items-center">
        <div className="text-center mb-6">
          <Image src="/logo.png" alt="Agency CRM Logo" width={64} height={64} className="w-16 h-16 object-contain mx-auto mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Set up your password</h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">Please choose a strong password</p>
        </div>

        <Card className="w-full border-border/50 shadow-xl shadow-primary/5 dark:shadow-none bg-card/50 backdrop-blur-xl transition-all">
          <form onSubmit={handleSetup} className="flex flex-col h-full">
            <div className="p-6 pb-2 text-center">
              <CardTitle className="text-xl">Create Password</CardTitle>
            </div>

            <CardContent className="space-y-5 px-6 pb-6 pt-4 flex-1">
              {errorMsg && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20 text-center font-medium">
                  {errorMsg}
                </div>
              )}
              {success ? (
                <div className="bg-emerald-500/10 text-emerald-500 text-sm p-3 rounded-md border border-emerald-500/20 text-center font-medium">
                  Password set! Redirecting to login…
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-background/50 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm Password</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="bg-background/50 h-11"
                    />
                  </div>

                  <div className="pt-2">
                    <Button type="submit" className="w-full text-base h-11" disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Password"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  )
}
