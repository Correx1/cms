"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Send, ShieldAlert, Building2, Briefcase, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function NewUserPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  const [role, setRole] = useState("staff")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [department, setDepartment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <h2 className="text-2xl font-bold">Unauthorized Configuration Layer</h2>
        <p className="text-muted-foreground mt-2">Only administrators can dynamically execute User Generation pipelines.</p>
        <Button className="mt-6 shadow-sm font-semibold" onClick={() => router.back()}>Cancel Operation</Button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Using Magic Link Provisioning explicitly loading metadata natively catching Database Triggers globally without dropping current exact Admin Session safely seamlessly explicitly globally securely flexibly
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: {
          name,
          role,
          phone,
          ...(role === "client" ? { company } : {}),
          ...(role === "staff" ? { department } : {})
        }
      }
    })

    if (error) {
      toast.error(`Execution Rejected: ${error.message}`)
      setSubmitting(false)
      return
    }

    toast.success("Native account provisioned & Magic Link dispatched!")
    
    if (role === "client") {
      router.push("/clients")
    } else {
      router.push("/staff")
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/staff">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generate Secure User Manifest</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Push structural node extracting exact physical identity matching global arrays accurately via Webhooks actively.</p>
        </div>
      </div>

      <Card className="shadow-sm border-border/50">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Physical Identity Allocation</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <ShieldAlert className="h-4 w-4 text-yellow-500" />
              Dynamic Triggers compile Profiles locally automatically mapping metadata without explicit passwords safely flexibly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="name">Target Name Identifier</Label>
                <Input 
                  id="name" 
                  placeholder="E.g. Emily Chen" 
                  required 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="bg-background shadow-sm font-medium" 
                />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="email">Email Connection String</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="emily@agency.com" 
                  required 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-background shadow-sm font-medium" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Explicit Phone Routing Signal (Optional)</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="+1 (555) 000-0000" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="bg-background shadow-sm font-medium" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-5 mt-2">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="role">Global Authorization Tier</Label>
                <Select required value={role} onValueChange={(val) => setRole(val || "staff")}>
                  <SelectTrigger className="bg-background shadow-sm font-bold">
                    <SelectValue placeholder="Lock Access Vector..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin" className="font-semibold">Administrator Instance</SelectItem>
                    <SelectItem value="staff" className="font-semibold">Staff Block</SelectItem>
                    <SelectItem value="client" className="font-semibold">Client Target Configuration</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">Resolving strict pipeline boundaries exactly.</p>
              </div>
            </div>

            {role === "client" && (
              <div className="grid grid-cols-1 gap-4 border-t border-border/50 pt-5 mt-2 bg-primary/5 p-4 rounded-lg animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2">
                  <Label htmlFor="company" className="flex items-center gap-1.5"><Building2 className="h-4 w-4 text-primary"/> Corporate Mapping ID</Label>
                  <Input 
                    id="company" 
                    placeholder="E.g. Acme Corp Base" 
                    required 
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    className="bg-background shadow-sm font-semibold" 
                  />
                  <p className="text-[11px] text-muted-foreground mt-1 font-medium">Implicit boundary tracking.</p>
                </div>
              </div>
            )}

            {role === "staff" && (
              <div className="grid grid-cols-1 gap-4 border-t border-border/50 pt-5 mt-2 bg-primary/5 p-4 rounded-lg animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2">
                  <Label htmlFor="department" className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-primary"/> Technical Job Path</Label>
                  <Input 
                    id="department" 
                    placeholder="E.g. Native Integrations Hook Developer" 
                    required 
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="bg-background shadow-sm font-semibold" 
                  />
                </div>
              </div>
            )}
            
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t border-border/50 pt-4 bg-muted/10 pb-4">
            <Button variant="outline" type="button" onClick={() => router.back()} disabled={submitting}>
              Terminate Flow
            </Button>
            <Button type="submit" disabled={submitting} className="font-bold">
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Fire Database Generation Trigger
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
