"use client"

import { useAuth } from "@/lib/auth-context"
import { mockClients } from "@/lib/mock/clients"
import { mockStaff } from "@/lib/mock/staff"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, DollarSign, Building2, User, Activity, Calendar, FileText, Text } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function NewProjectPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [clientId, setClientId] = useState<string>("")
  const [status, setStatus] = useState<string>("pending")

  if (user?.role === "client") {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <h2 className="text-2xl font-bold">Unauthorized</h2>
        <p className="text-muted-foreground mt-2">Only agency staff can create new projects.</p>
        <Button className="mt-6" onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock save, return to projects
    router.push("/projects")
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-9 w-9 shadow-sm" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Projects</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Create Project</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Configure parameters and assignments for a new engagement.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Core Data */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
              <CardTitle className="text-lg">General Information</CardTitle>
              <CardDescription>The core identifying details and objective scopes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2.5">
                <Label htmlFor="title" className="text-sm font-semibold">Project Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Acme Corp Branding Refresh" 
                  required 
                  className="h-11 bg-background text-base placeholder:text-muted-foreground/50 transition-colors focus-visible:ring-1" 
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="details" className="text-sm font-semibold flex items-center gap-2">
                  <Text className="h-4 w-4 text-muted-foreground" /> Overview & Background
                </Label>
                <p className="text-[13px] text-muted-foreground mb-2">Summarize the client&apos;s request and the primary goals of this project.</p>
                <textarea 
                  id="details" 
                  className="flex min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-3 text-sm ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 transition-colors"
                  placeholder="The client wants to overhaul their 2018 website and re-align their brand guidelines..."
                  required
                />
              </div>

              <div className="space-y-2.5 border-t border-border/50 pt-6 mt-2">
                <Label htmlFor="deliverables" className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" /> Key Deliverables
                </Label>
                <p className="text-[13px] text-muted-foreground mb-2">List out the actual files, assets, or services to be handed off.</p>
                <textarea 
                  id="deliverables" 
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-3 text-sm ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 transition-colors font-mono"
                  placeholder="- UI/UX Figma Files&#10;- Next.js Codebase repository&#10;- Vercel Deployment"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50 overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
              <CardTitle className="text-lg text-primary">Initial Attachments</CardTitle>
              <CardDescription className="text-primary/70">Upload signed SLA contracts, brand guidelines, or assets.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              
              <div className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center bg-background/50 hover:bg-muted/50 transition-colors">
                <Input 
                  id="files" 
                  type="file" 
                  multiple 
                  className="hidden" 
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                />
                <Button variant="secondary" type="button" onClick={() => document.getElementById('files')?.click()} className="mb-2 shadow-sm">
                  Browse Files
                </Button>
                <p className="text-sm text-muted-foreground mt-2">or drag and drop them here</p>
                <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">PDF, DOCX, ZIP up to 50MB</p>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-border/50 pt-4">
                  <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                    Staged for Upload ({selectedFiles.length})
                  </span>
                  {selectedFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border border-border/50 rounded-lg bg-background shadow-sm">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold truncate leading-none">{file.name}</span>
                        <span className="text-[11px] text-muted-foreground mt-1 leading-none">{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Meta Data Configuration */}
        <div className="space-y-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
              <CardTitle className="text-lg">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              
              {/* Client Mapping */}
              <div className="space-y-2.5">
                <Label htmlFor="client" className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" /> Associated Client
                </Label>
                <Select required value={clientId} onValueChange={(val) => setClientId(val || "")}>
                  <SelectTrigger className="min-h-[44px] h-auto py-2 bg-background transition-colors focus:ring-1 shadow-sm [&>span]:whitespace-normal [&>span]:text-left [&>span]:break-words">
                    {clientId ? mockClients.find(c => c.id === clientId)?.company : <span className="text-muted-foreground">Select a corporate client...</span>}
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {mockClients.map(c => (
                      <SelectItem key={c.id} value={c.id} className="cursor-pointer py-2.5 font-medium">
                        {c.company} <span className="text-muted-foreground font-normal ml-1">({c.name})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Staff Assignment */}
              <div className="space-y-2.5">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" /> Assigned Staff Members
                </Label>
                <div className="space-y-2 p-3 border border-border/50 rounded-md bg-background shadow-sm max-h-[220px] overflow-y-auto">
                  {mockStaff.map(s => (
                    <div key={s.id} className="flex items-start space-x-3 bg-muted/20 p-2.5 rounded-md hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                      <input 
                        type="checkbox" 
                        id={`staff-${s.id}`} 
                        value={s.id} 
                        className="h-4 w-4 mt-0.5 rounded border-border text-primary focus:ring-1 focus:ring-primary accent-primary cursor-pointer" 
                      />
                      <Label htmlFor={`staff-${s.id}`} className="flex items-start gap-3 cursor-pointer w-full">
                        <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-[11px] font-bold shrink-0">
                          {s.name.charAt(0)}
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold leading-none">{s.name}</span>
                          <span className="text-muted-foreground text-xs leading-none">
                            {s.role === "admin" ? "Director / Administrator" : "Technical Specialist"}
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/50 my-3"></div>

              {/* Status & Timeline */}
              <div className="space-y-2.5">
                <Label htmlFor="status" className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" /> Pipeline Status
                </Label>
                <Select value={status} onValueChange={(val) => setStatus(val || "pending")} required>
                  <SelectTrigger className="h-11 bg-background transition-colors focus:ring-1 shadow-sm">
                    <span className="capitalize">{status}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending" className="cursor-pointer py-2">Pending</SelectItem>
                    <SelectItem value="active" className="cursor-pointer py-2">Active</SelectItem>
                    <SelectItem value="completed" className="cursor-pointer py-2">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="deadline" className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" /> Target Deadline
                </Label>
                <Input 
                  id="deadline" 
                  type="date" 
                  required 
                  className="h-11 bg-background transition-colors focus-visible:ring-1 shadow-sm" 
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="price" className="text-sm font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-500" /> Project Budget
                </Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-muted-foreground/70 font-medium">$</span>
                  <Input 
                    id="price" 
                    type="text" 
                    placeholder="15,000" 
                    className="h-11 pl-7 bg-background transition-colors focus-visible:ring-1 shadow-sm font-medium" 
                  />
                </div>
              </div>

            </CardContent>
            <CardFooter className="bg-muted/10 border-t border-border/50 p-4 rounded-b-xl flex flex-col sm:flex-row gap-3">
              <Button type="submit" size="lg" className="w-full sm:flex-1 shadow-md">
                <Save className="mr-2 h-4 w-4" /> Finalize Creation
              </Button>
              <Button variant="outline" size="lg" type="button" asChild className="w-full sm:w-auto bg-background">
                <Link href="/projects">Cancel</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
