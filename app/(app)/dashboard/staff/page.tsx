"use client"

import { useAuth } from "@/lib/auth-context"
import { mockProjects, Project } from "@/lib/mock/projects"
import { mockClients } from "@/lib/mock/clients"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FolderKanban, Upload, FileText, Download, Calendar, Trash2 } from "lucide-react"
import { useState } from "react"

export default function StaffDashboard() {
  const { user } = useAuth()
  
  // Filter projects assigned to this staff member
  const [assignedProjects, setAssignedProjects] = useState(mockProjects.filter(p => p.assignedStaffIds.includes(user?.id || "")))

  // Dialog State Tracker
  const [completeModalOpen, setCompleteModalOpen] = useState(false)
  const [projectToComplete, setProjectToComplete] = useState<string | null>(null)
  const [completionNotes, setCompletionNotes] = useState("")
  const [completionLinks, setCompletionLinks] = useState("")
  const [completionFiles, setCompletionFiles] = useState<File[]>([])
  
  // Get upcoming deadlines for assigned projects
  const upcomingDeadlines = [...assignedProjects]
    .filter(p => p.status !== "completed")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5)

  // Get all files from assigned projects
  const allFiles = assignedProjects.flatMap(p => 
    p.files.map(f => ({ ...f, projectTitle: p.title }))
  ).sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
  .slice(0, 5)

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "approved": return <Badge className="bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border-indigo-500/20">Approved</Badge>
      case "completed": return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Completed</Badge>
      case "active": return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">Active</Badge>
      default: return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">Pending</Badge>
    }
  }

  const handleStatusChange = (projectId: string, newStatus: string) => {
    if (newStatus === "completed") {
      setProjectToComplete(projectId)
      setCompleteModalOpen(true)
      return
    }
    setAssignedProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus as Project['status'] } : p))
  }

  const submitCompletion = () => {
    if (projectToComplete) {
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
      setAssignedProjects(prev => prev.map(p => p.id === projectToComplete ? { ...p, status: "completed", completionDetails: details } : p))
    }
    setCompleteModalOpen(false)
    setProjectToComplete(null)
    setCompletionNotes("")
    setCompletionLinks("")
    setCompletionFiles([])
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Workspace</h1>
        <p className="text-muted-foreground mt-1">Manage your assigned projects and deadlines.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Module 1 & 3: Assigned Projects & Update Project Status */}
        <Card className="md:col-span-2 shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Projects</CardTitle>
              <CardDescription>Projects currently assigned to you</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {assignedProjects.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead>Project</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedProjects.map(project => {
                    const client = mockClients.find(c => c.id === project.clientId)
                    return (
                      <TableRow key={project.id} className="border-border/50">
                        <TableCell className="font-medium">{project.title}</TableCell>
                        <TableCell className="text-muted-foreground">{client?.name}</TableCell>
                        <TableCell>
                          <span className="flex items-center whitespace-nowrap text-xs">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select value={project.status} onValueChange={(val) => handleStatusChange(project.id, val as Project['status'])}>
                              <SelectTrigger className="w-[120px] h-8 text-xs">
                                <span className="capitalize">{project.status}</span>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <FolderKanban className="mx-auto h-8 w-8 opacity-50 mb-2" />
                <p>No projects assigned yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Deadlines & Files */}
        <div className="space-y-4 md:col-span-1">
          {/* Module 2: Deadlines */}
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Tasks requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingDeadlines.length > 0 ? upcomingDeadlines.map(project => {
                  const daysLeft = Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
                  return (
                    <div key={project.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{project.title}</p>
                        <div className="flex items-center mt-1">
                          {getStatusBadge(project.status)}
                        </div>
                      </div>
                      <Badge variant={daysLeft < 3 ? "destructive" : "secondary"} className="whitespace-nowrap ml-2">
                        {daysLeft < 0 ? "Overdue" : `${daysLeft} days`}
                      </Badge>
                    </div>
                  )
                }) : (
                  <p className="text-muted-foreground text-sm text-center py-4">No upcoming deadlines</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Module 4: Upload / View Files */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div className="space-y-1">
                <CardTitle>Recent Files</CardTitle>
                <CardDescription>From your projects</CardDescription>
              </div>
              <Button size="icon" variant="outline" className="h-8 w-8">
                <Upload className="h-4 w-4" />
                <span className="sr-only">Upload File</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mt-4">
                {allFiles.length > 0 ? allFiles.map(file => (
                  <div key={file.id} className="flex items-center gap-3 border bg-muted/30 p-2 rounded-md">
                    <div className="p-2 bg-primary/10 rounded">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <p className="text-sm font-medium leading-none truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{file.projectTitle}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                )) : (
                  <p className="text-muted-foreground text-sm text-center py-4">No files available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
                <Input type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => {
                  if (e.target.files) setCompletionFiles([...completionFiles, ...Array.from(e.target.files)])
                }} />
                <FolderKanban className="h-8 w-8 mb-2 opacity-70" />
                <p className="text-sm font-medium">Click or drag files to upload</p>
                {completionFiles.length > 0 && (
                  <div className="mt-4 w-full space-y-2 text-left z-20 relative">
                    <p className="text-xs text-primary font-semibold border-b pb-1">{completionFiles.length} file(s) pending upload:</p>
                    <div className="max-h-[120px] overflow-y-auto space-y-1.5 pr-2">
                      {completionFiles.map((f, i) => (
                        <div key={i} className="flex items-center justify-between bg-background p-1.5 rounded-md border text-xs shadow-sm">
                          <span className="truncate pr-2 font-medium">{f.name}</span>
                          <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 text-destructive hover:bg-destructive/10" onClick={(e) => {
                            e.preventDefault();
                            setCompletionFiles(prev => prev.filter((_, idx) => idx !== i));
                          }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
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
