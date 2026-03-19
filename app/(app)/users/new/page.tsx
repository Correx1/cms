"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NewUserPage() {
  const { user } = useAuth()
  const router = useRouter()

  if (user?.role !== "admin") {
    // Fast-fail for unauthorized UI access
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <h2 className="text-2xl font-bold">Unauthorized</h2>
        <p className="text-muted-foreground mt-2">Only administrators can create user accounts.</p>
        <Button className="mt-6" onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock save
    router.push("/staff")
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/staff">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create User Account</h1>
          <p className="text-muted-foreground mt-1">Provision a new login for a staff member or client.</p>
        </div>
      </div>

      <Card className="shadow-sm border-border/50">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <ShieldAlert className="h-4 w-4 text-yellow-500" />
              Credentials will be assigned to this user role across the system.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="E.g. Emily Chen" required className="bg-background/50" />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="email">Email Address (Login ID)</Label>
                <Input id="email" type="email" placeholder="emily@agency.com" required className="bg-background/50" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-5 mt-2">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="role">Account Role</Label>
                <Select required defaultValue="staff">
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select a role..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="staff">Staff Member</SelectItem>
                    <SelectItem value="client">Client Portal User</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground mt-1.5">Determines dashboard and data access.</p>
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="password">Default Password</Label>
                <Input id="password" type="text" defaultValue="TempPassword123!" required className="bg-background/50 font-mono text-sm" />
                <p className="text-[11px] text-muted-foreground mt-1.5">Share this with the user securely.</p>
              </div>
            </div>
            
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t border-border/50 pt-4 bg-muted/20 pb-4">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" /> Provision Account
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
