"use client"

import { useAuth } from "@/lib/auth-context"
import { mockProjects } from "@/lib/mock/projects"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FolderKanban, Clock, Calendar, FileText, Download, CheckCircle2, Activity, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ClientDashboard() {
  const { user } = useAuth()
  
  // Projects belonging to this client
  const clientProjects = mockProjects.filter(p => p.clientId === user?.id)
  
  // All files across this client's projects
  const allFiles = clientProjects.flatMap(p => 
    p.files.map(f => ({ ...f, projectTitle: p.title }))
  ).sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
  .slice(0, 5)

  // Determine active project to feature (or most recent pending)
  const featuredProject = clientProjects.find(p => p.status === "active") 
    || clientProjects.find(p => p.status === "pending")
    || clientProjects[0]

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "completed": return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      case "active": return <Activity className="h-5 w-5 text-blue-500" />
      default: return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case "completed": return "text-emerald-500 border-emerald-500 bg-emerald-500/10"
      case "active": return "text-blue-500 border-blue-500 bg-blue-500/10"
      default: return "text-yellow-500 border-yellow-500 bg-yellow-500/10"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Client Portal</h1>
        <p className="text-muted-foreground mt-1">Ready for your review. Here&apos;s a quick summary of what we accomplished.</p>
      </div>

      {clientProjects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <FolderKanban className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">No active projects</h2>
          <p className="text-muted-foreground mt-2 max-w-sm">
            You don&apos;t have any associated projects right now. Please contact your account manager to get started.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          
          {/* Main Column: Featured Project & All Projects */}
          <div className="space-y-6 md:col-span-2">
            
            {/* Module 4: Status Tracking (Visual Indicator) */}
            {featuredProject && (
              <Card className="shadow-sm border-border/50 overflow-hidden bg-linear-to-br from-background to-muted/20 relative">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <FolderKanban className="h-32 w-32" />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{featuredProject.title}</CardTitle>
                      <CardDescription className="mt-1.5 flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" /> 
                        Due {new Date(featuredProject.deadline).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={`capitalize px-3 py-1 ${getStatusColor(featuredProject.status)}`}>
                      {featuredProject.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Status Progress Bar */}
                  <div className="mt-4 relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-secondary -translate-y-1/2 rounded-full hidden sm:block"></div>
                    
                    {/* Progress Fill */}
                    <div 
                      className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full hidden sm:block transition-all duration-1000" 
                      style={{ 
                        width: featuredProject.status === "completed" ? "100%" : 
                               featuredProject.status === "active" ? "50%" : "0%" 
                      }}
                    ></div>

                    <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-4 sm:gap-0">
                      
                      {/* Step 1: Pending */}
                      <div className="flex sm:flex-col items-center gap-3 sm:gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-card
                          ${(featuredProject.status === "pending" || featuredProject.status === "active" || featuredProject.status === "completed") 
                            ? "border-primary text-primary" 
                            : "border-muted text-muted-foreground"}`}
                        >
                          <Clock className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">Scoping</span>
                      </div>

                      {/* Step 2: Active */}
                      <div className="flex sm:flex-col items-center gap-3 sm:gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-card
                          ${(featuredProject.status === "active" || featuredProject.status === "completed") 
                            ? "border-primary text-primary" 
                            : "border-muted text-muted-foreground"}`}
                        >
                          <Activity className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">In Development</span>
                      </div>

                      {/* Step 3: Completed */}
                      <div className="flex sm:flex-col items-center gap-3 sm:gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-card
                          ${featuredProject.status === "completed" 
                            ? "border-primary text-primary" 
                            : "border-muted text-muted-foreground"}`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">Delivered</span>
                      </div>

                    </div>
                  </div>

                  {/* Module 3: Deliverables */}
                  <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border/50">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <FolderKanban className="h-4 w-4 text-primary" /> Key Deliverables
                    </h4>
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                      {featuredProject.deliverables}
                    </pre>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/projects/${featuredProject.id}`}>
                      View Full Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Module 1: My Projects Table */}
            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle>All Projects</CardTitle>
                <CardDescription>Your project history and active requests</CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6 sm:pt-0">
                <div className="overflow-x-auto w-full">
                  <Table className="min-w-[600px]">
                    <TableHeader>
                      <TableRow className="border-border/50">
                        <TableHead>Project</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientProjects.map(project => (
                        <TableRow key={project.id} className="border-border/50">
                          <TableCell className="font-medium">{project.title}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(project.status)}
                              <span className="capitalize text-sm">{project.status}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/projects/${project.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Files */}
          <div className="space-y-6 md:col-span-1">
            {/* Module 5: View Files */}
            <Card className="shadow-sm border-border/50 h-full max-h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle>Project Files</CardTitle>
                <CardDescription>Documents and final deliverables shared with you</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                <div className="space-y-3">
                  {allFiles.length > 0 ? allFiles.map(file => (
                    <div key={file.id} className="group relative flex flex-col gap-2 border bg-card p-3 rounded-lg hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 overflow-hidden">
                          <div className="p-2 bg-primary/10 rounded-md text-primary shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="space-y-1 min-w-0">
                            <p className="text-sm font-medium leading-none truncate pr-4">{file.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{file.projectTitle}</p>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-[10px] text-muted-foreground text-right">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 opacity-60">
                      <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-medium">No files shared yet</p>
                      <p className="text-xs mt-1 text-muted-foreground">When files are uploaded to your projects, they will appear here.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      )}
    </div>
  )
}
