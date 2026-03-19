"use client"

import { useAuth } from "@/lib/auth-context"
import { mockProjects, Project } from "@/lib/mock/projects"
import { mockClients } from "@/lib/mock/clients"
import { mockStaff } from "@/lib/mock/staff"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, FolderKanban, Clock, CheckCircle2, Search, Filter, Activity, Calendar, ChevronDown, ListChecks, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function ProjectsPage() {
  const { user } = useAuth()
  const [projectsState, setProjectsState] = useState<Project[]>(mockProjects)
  const [completeModalOpen, setCompleteModalOpen] = useState(false)
  const [projectToComplete, setProjectToComplete] = useState<string | null>(null)
  const [completionNotes, setCompletionNotes] = useState("")
  const [completionLinks, setCompletionLinks] = useState("")
  const [completionFiles, setCompletionFiles] = useState<File[]>([])

  // Phase 1 local state filter
  let visibleProjects = projectsState
  if (user?.role === "staff") {
    visibleProjects = projectsState.filter(p => p.assignedStaffIds.includes(user.id))
  } else if (user?.role === "client") {
    visibleProjects = projectsState.filter(p => p.clientId === user.id)
  }

  const handleStatusChange = (projectId: string, newStatus: Project['status']) => {
    if (newStatus === "completed") {
      setProjectToComplete(projectId)
      setCompleteModalOpen(true)
      return
    }
    // Optimistic UI update wrapper
    setProjectsState(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p))
  }

  const submitCompletion = () => {
    if (projectToComplete) {
      // Form structural completion payload map
      const details = {
        notes: completionNotes,
        links: completionLinks.split('\n').map(l => l.trim()).filter(Boolean),
        files: completionFiles.map((f, i) => ({
          id: `newf-${i}`,
          name: f.name,
          type: f.type,
          url: URL.createObjectURL(f),
          uploadedAt: new Date().toISOString()
        }))
      }
      setProjectsState(prev => prev.map(p => p.id === projectToComplete ? { ...p, status: "completed", completionDetails: details } : p))
    }
    setCompleteModalOpen(false)
    setProjectToComplete(null)
    setCompletionNotes("")
    setCompletionLinks("")
    setCompletionFiles([])
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "approved": return <ShieldCheck className="h-4 w-4 text-indigo-500" />
      case "completed": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      case "active": return <Activity className="h-4 w-4 text-blue-500" />
      default: return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case "approved": return "text-indigo-500 border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20"
      case "completed": return "text-emerald-500 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20"
      case "active": return "text-blue-500 border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20"
      default: return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10 hover:bg-yellow-500/20"
    }
  }

  const getAssignedStaffNames = (staffIds: string[]) => {
    if (!staffIds || staffIds.length === 0) return "None"
    return staffIds
      .map(id => mockStaff.find(s => s.id === id)?.name)
      .filter(Boolean)
      .join(", ")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Projects Directory</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Track and manage all agency projects.</p>
        </div>
        {(user?.role === "admin") && (
          <Button className="shadow-sm shadow-primary/20 w-full sm:w-auto" asChild>
            <Link href="/projects/new">
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Link>
          </Button>
        )}
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="py-4 border-b border-border/50 bg-card rounded-t-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-base md:text-lg font-medium flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-muted-foreground" />
              All Projects
            </CardTitle>
            <div className="flex w-full sm:w-auto gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search projects by name..."
                  className="w-full pl-9 bg-background/50 h-9"
                />
              </div>
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/50">
                  <TableHead className="w-[250px] py-4 pl-6 text-sm">Project Title</TableHead>
                  <TableHead className="py-4 text-sm">Client</TableHead>
                  <TableHead className="py-4 text-sm">Status</TableHead>
                  <TableHead className="py-4 text-sm hidden md:table-cell">Assigned Staff</TableHead>
                  <TableHead className="py-4 text-sm hidden lg:table-cell">Deadline</TableHead>
                  <TableHead className="py-4 pr-6 text-right text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleProjects.length > 0 ? visibleProjects.map(project => {
                  const client = mockClients.find(c => c.id === project.clientId)
                  return (
                    <TableRow key={project.id} className="border-border/50 group hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium pl-6 py-4">
                        <div className="space-y-1">
                          <Link href={`/projects/${project.id}`} className="leading-tight flex items-center gap-2 group-hover:text-primary transition-colors text-base break-words">
                            {project.title}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-sm font-medium text-foreground">
                          {client?.name || "Unknown"}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        {(user?.role === "admin" || user?.role === "staff") ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className={`h-8 w-[110px] justify-between px-2.5 ${getStatusColor(project.status)}`}>
                                <span className="flex items-center gap-1.5 capitalize text-xs">
                                  {getStatusIcon(project.status)}
                                  {project.status}
                                </span>
                                <ChevronDown className="h-3 w-3 opacity-70" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem onClick={() => handleStatusChange(project.id, "pending")} className="cursor-pointer">
                                <Clock className="mr-2 h-4 w-4 text-yellow-500" /> Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(project.id, "active")} className="cursor-pointer">
                                <Activity className="mr-2 h-4 w-4 text-blue-500" /> Active
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(project.id, "completed")} className="cursor-pointer">
                                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Completed
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <div className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase transition-colors gap-1.5 ${getStatusColor(project.status)}`}>
                            {getStatusIcon(project.status)}
                            {project.status}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-4 hidden md:table-cell">
                        <div className="text-sm text-muted-foreground whitespace-nowrap truncate max-w-[150px]">
                          {getAssignedStaffNames(project.assignedStaffIds)}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 hidden lg:table-cell text-sm font-medium text-muted-foreground">
                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                          <Calendar className="h-4 w-4" />
                          {new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 shadow-sm">
                              <ListChecks className="mr-2 h-4 w-4" />
                              <span className="hidden sm:inline-block">Options</span>
                              <ChevronDown className="ml-1 sm:ml-2 h-3 w-3 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuItem asChild>
                              <Link href={`/projects/${project.id}`}>View Details</Link>
                            </DropdownMenuItem>
                            {(user?.role === "admin") && (
                              <DropdownMenuItem asChild>
                                <Link href={`/projects/${project.id}/edit`}>Edit Project</Link>
                              </DropdownMenuItem>
                            )}
                            {user?.role === "admin" && (
                              <DropdownMenuItem className="text-destructive font-semibold">Delete Project</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                }) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground text-base">
                      No matching projects found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Project</DialogTitle>
            <DialogDescription>
              Please provide a summary of the work completed and upload final deliverables before closing this project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Work Summary <span className="text-destructive">*</span></Label>
              <textarea 
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Briefly describe the outcome..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Important Links (Optional)</Label>
              <textarea 
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="https://example.com/live-site (one per line)"
                value={completionLinks}
                onChange={(e) => setCompletionLinks(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Final Deliverables (Optional)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 relative">
                <Input type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => {
                  if (e.target.files) setCompletionFiles(Array.from(e.target.files))
                }} />
                <FolderKanban className="h-8 w-8 mb-2 opacity-70" />
                <p className="text-sm font-medium">Click or drag files to upload</p>
                {completionFiles.length > 0 && (
                  <p className="text-xs text-primary mt-2 font-semibold">{completionFiles.length} file(s) selected</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteModalOpen(false)}>Cancel</Button>
            <Button disabled={!completionNotes.trim()} onClick={submitCompletion}>Submit & Complete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
