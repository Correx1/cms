"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Redirect based on entered details handled in AuthContext
    login(email)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8 md:p-8">
      <div className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2">
        <Image src="/logo.png" alt="Agency CRM" width={40} height={40} className="w-10 h-10 object-contain" />
      </div>

      <div className="w-full max-w-sm sm:max-w-md animate-in fade-in zoom-in duration-500 flex flex-col items-center">
        
        <div className="text-center mb-6">
          <Image src="/logo.png" alt="Agency CRM Logo" width={64} height={64} className="w-16 h-16 object-contain mx-auto mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">Sign in to your account</p>
        </div>

        <Card className="w-full border-border/50 shadow-xl shadow-primary/5 dark:shadow-none bg-card/50 backdrop-blur-xl">
          <form onSubmit={handleLogin} className="flex flex-col h-full">
            <div className="p-6 pb-2 text-center">
              <CardTitle className="text-xl">Sign In</CardTitle>
            </div>
            
            <CardContent className="space-y-5 px-6 pb-6 pt-4 flex-1">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="bg-background/50 h-11"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-xs text-primary hover:underline">Forgot?</a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" 
                  required 
                  className="bg-background/50 h-11"
                />
              </div>
              
              <div className="pt-2">
                <Button type="submit" className="w-full text-base h-11">
                  Sign In
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>

        <div className="mt-8 p-4 bg-muted/30 border border-border/50 rounded-lg w-full text-sm">
          <h3 className="font-semibold mb-2">Temporary Login Credentials:</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li><strong>Admin:</strong> admin@agency.com <br className="sm:hidden"/>(Any password)</li>
            <li><strong>Staff:</strong> staff@agency.com <br className="sm:hidden"/>(Any password)</li>
            <li><strong>Client:</strong> anything else <br className="sm:hidden"/>(Any password)</li>
          </ul>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
