"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NewClientPage() {
  const { user } = useAuth()
  const router = useRouter()

  if (user?.role !== "admin") {
    // Phase 1 fast-fail for unauthorized UI access
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <h2 className="text-2xl font-bold">Unauthorized</h2>
        <p className="text-muted-foreground mt-2">You do not have permission to add new clients.</p>
        <Button className="mt-6" onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock save, just route back
    router.push("/clients")
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Clients</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Client</h1>
          <p className="text-muted-foreground mt-1">Create a new client profile in the system.</p>
        </div>
      </div>

      <Card className="shadow-sm border-border/50">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Enter the primary contact and company details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="E.g. Jane Doe" required className="bg-background/50" />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="company">Company</Label>
                <Input id="company" placeholder="E.g. Acme Corp" required className="bg-background/50" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="jane@acme.com" required className="bg-background/50" />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" className="bg-background/50" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes (Optional)</Label>
              <textarea 
                id="notes" 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Background information about this client..."
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t border-border/50 pt-4">
            <Button variant="outline" type="button" asChild>
              <Link href="/clients">Cancel</Link>
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" /> Save Client
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
