/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useAuth } from "@/lib/auth-context"
import { mockProjects } from "@/lib/mock/projects"
import { mockClients } from "@/lib/mock/clients"
import { mockStaff } from "@/lib/mock/staff"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Activity, CheckCircle2, Calendar, FolderKanban, Edit, User, Upload, FileText, Download, Building2, DollarSign, ExternalLink, Image as ImageIcon, ChevronDown, Trash2, AlertCircle, ThumbsUp, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function ProjectDetailsPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const projectId = params?.id as string
  
  const [project, setProject] = useState(mockProjects.find(p => p.id === projectId) || mockProjects[0])
  const client = mockClients.find(c => c.id === project.clientId)

  const [completeModalOpen, setCompleteModalOpen] = useState(false)
  const [completionNotes, setCompletionNotes] = useState("")
  const [completionLinks, setCompletionLinks] = useState("")
  const [completionFiles, setCompletionFiles] = useState<File[]>([])

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "approved": return <ShieldCheck className="h-5 w-5 text-indigo-500" />
      case "completed": return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      case "active": return <Activity className="h-5 w-5 text-blue-500" />
      default: return <Clock className="h-5 w-5 text-yellow-500" />
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

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === "completed") {
      if (project.completionDetails) {
        setCompletionNotes(project.completionDetails.notes)
        setCompletionLinks(project.completionDetails.links?.join('\n') || "")
        // Files can't be automatically pre-populated in a standard Input without fetching, but we'll leave it empty to append new ones.
      }
      setCompleteModalOpen(true)
      return
    }
    setProject({ ...project, status: newStatus as any })
  }

  const submitCompletion = () => {
    const details = {
      notes: completionNotes,
      links: completionLinks.split('\n').map(l => l.trim()).filter(Boolean),
      files: [
        ...(project.completionDetails?.files || []),
        ...completionFiles.map((f, i) => ({
          id: `newf-${i}`,
          name: f.name,
          type: f.type,
          url: URL.createObjectURL(f),
          uploadedAt: new Date().toISOString()
        }))
      ]
    }
    setProject({ ...project, status: "completed", completionDetails: details })
    setCompleteModalOpen(false)
  }

  const deleteCompletionFile = (fileId: string) => {
    if (!project.completionDetails) return;
    setProject({
      ...project,
      completionDetails: {
        ...project.completionDetails,
        files: project.completionDetails.files.filter((f: any) => f.id !== fileId)
      }
    });
  }

  const deleteProjectFile = (fileId: string) => {
    setProject({ ...project, files: project.files.filter((f: any) => f.id !== fileId) });
  }

  if (user?.role === "client" && project.clientId !== user.id && project.id !== mockProjects[0].id) {
    // Basic protection - mock UI only. Use fixed logic for Phase 1.
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Go Back</span>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
              {(user?.role === "admin" || user?.role === "staff") ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Badge variant="outline" className={`capitalize gap-1.5 pl-1.5 mb-1 cursor-pointer transition-colors ${getStatusColor(project.status)}`}>
                      {getStatusIcon(project.status)}
                      {project.status}
                      <ChevronDown className="h-3 w-3 opacity-70 ml-1" />
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => handleStatusChange("pending")} className="cursor-pointer">
                      <Clock className="mr-2 h-4 w-4 text-yellow-500" /> Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange("active")} className="cursor-pointer">
                      <Activity className="mr-2 h-4 w-4 text-blue-500" /> Active
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange("completed")} className="cursor-pointer">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Completed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Badge variant="outline" className={`capitalize gap-1.5 pl-1.5 mb-1 ${getStatusColor(project.status)}`}>
                  {getStatusIcon(project.status)}
                  {project.status}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1 text-sm flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5" /> {client?.company || "Unknown"}
            </p>
          </div>
        </div>
        {(user?.role === "admin") && (
          <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
            <Button variant="outline" className="shadow-sm border-border/50" asChild>
              <Link href={`/projects/${project.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit Details
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Details & Deliverables */}
        <div className="space-y-6 md:col-span-2">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6 text-sm leading-relaxed whitespace-pre-wrap">
              {project.details}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-primary" /> Key Deliverables
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-muted/30 p-4 rounded-lg border border-border/50 font-mono text-sm whitespace-pre-wrap text-muted-foreground shadow-inner">
                {project.deliverables}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Meta & Files */}
        <div className="space-y-6 md:col-span-1">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase font-semibold">Deadline</span>
                <div className="flex items-center font-medium">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  {new Date(project.deadline).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-border/50">
                <span className="text-xs text-muted-foreground uppercase font-semibold">Budget / Price</span>
                <div className="flex items-center font-medium text-emerald-600 dark:text-emerald-400">
                  <DollarSign className="mr-1.5 h-4 w-4" />
                  {project.price ? project.price : "Custom Price"}
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-border/50">
                <span className="text-xs text-muted-foreground uppercase font-semibold">Client</span>
                <div className="flex items-center font-medium">
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold mr-2 ring-1 ring-primary/20">
                    {client?.name.substring(0,2).toUpperCase()}
                  </div>
                  {client?.name}
                </div>
              </div>
              
              <div className="space-y-2 pt-2 border-t border-border/50">
                <span className="text-xs text-muted-foreground uppercase font-semibold">Assigned Staff</span>
                <div className="flex flex-col gap-2">
                  {project.assignedStaffIds.length > 0 ? project.assignedStaffIds.map(staffId => {
                    const st = mockStaff.find(s => s.id === staffId)
                    return (
                      <div key={staffId} className="flex items-center text-sm font-medium bg-muted/40 p-1.5 rounded-md border border-border/50">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        {st?.name}
                      </div>
                    )
                  }) : (
                    <span className="text-sm text-muted-foreground italic">Unassigned</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Files Module */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Files</CardTitle>
                <CardDescription>Project attachments</CardDescription>
              </div>
              <Button size="icon" variant="outline" className="h-8 w-8 -mr-2 shadow-sm">
                <Upload className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {project.files.length > 0 ? project.files.map(file => (
                  <div key={file.id} className="group flex items-start justify-between border bg-card p-3 rounded-lg hover:border-primary/50 hover:shadow-md transition-all shadow-sm">
                    <div className="flex items-start gap-3 overflow-hidden">
                      <div className="p-2 bg-primary/10 rounded-md text-primary shrink-0 mt-0.5">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <p className="text-sm font-medium leading-none truncate">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(file.uploadedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {(user?.role === "admin" || user?.role === "staff") && (
                      <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10 mr-1" onClick={() => deleteProjectFile(file.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 bg-background/50 hover:bg-secondary">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )) : (
                  <div className="text-center py-6 border border-dashed rounded-lg bg-muted/20">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-20 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">No files attached yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {(project.status === "completed" || project.status === "approved") && project.completionDetails && (
        <Card className={`shadow-sm mt-6 mb-8 transition-colors ${project.status === 'approved' ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-emerald-500/30 bg-emerald-500/5'}`}>
          <CardHeader className="pb-4 border-b border-border/50 flex flex-row items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className={`flex items-center gap-2 ${project.status === 'approved' ? 'text-indigo-700 dark:text-indigo-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                {project.status === 'approved' ? <ShieldCheck className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />} 
                {project.status === 'approved' ? 'Approved Delivery Manifest' : 'Delivery Manifest'}
              </CardTitle>
              <CardDescription>
                {project.status === 'approved' ? 'This delivery has been officially approved and locked.' : 'Final deliverables and summary of completed work pending review.'}
              </CardDescription>
            </div>
            
            {project.status === "completed" && user?.role === "client" && (
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => handleStatusChange("active")} className="border-destructive/20 text-destructive hover:bg-destructive/10">
                  <AlertCircle className="h-4 w-4 mr-2" /> Request Revision
                </Button>
                <Button size="sm" onClick={() => handleStatusChange("approved")} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                  <ThumbsUp className="h-4 w-4 mr-2" /> Approve Project
                </Button>
              </div>
            )}
            
            {(user?.role === "admin" || user?.role === "staff") && project.status !== "approved" && (
              <Button variant="outline" size="sm" onClick={() => handleStatusChange("completed")} className="bg-background/50 hover:bg-background shrink-0">
                <Edit className="h-4 w-4 mr-2" /> Edit Output
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Work Summary</h4>
              <p className="text-sm whitespace-pre-wrap leading-relaxed max-w-4xl">{project.completionDetails.notes}</p>
            </div>
            
            {project.completionDetails.links && project.completionDetails.links.length > 0 && (
              <div className="space-y-3">
                 <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Important Links</h4>
                 <div className="flex flex-wrap gap-2">
                    {project.completionDetails.links.map((link, i) => {
                      let hostname = link;
                      try { hostname = new URL(link).hostname } catch {}
                      return (
                        <a key={i} href={link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline bg-background border px-3 py-1.5 rounded-md shadow-sm transition-colors hover:border-primary/50">
                          <ExternalLink className="h-4 w-4" /> {hostname}
                        </a>
                      )
                    })}
                 </div>
              </div>
            )}

            {project.completionDetails.files && project.completionDetails.files.length > 0 && (
              <div className="space-y-3">
                 <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Visuals & Files</h4>
                 <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin scrollbar-thumb-muted-foreground/20">
                    {project.completionDetails.files.map(file => {
                       const isImage = file.type.startsWith('image/');
                       return (
                         <div key={file.id} className="min-w-[280px] max-w-[320px] h-48 rounded-xl border bg-card overflow-hidden relative group snap-start shadow-sm hover:shadow-md transition-all shrink-0">
                           {isImage ? (
                             <img src={file.url} alt={file.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                           ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-muted/10">
                               <FileText className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
                               <span className="text-sm font-medium text-center truncate w-full px-2">{file.name}</span>
                             </div>
                           )}
                           <div className="absolute inset-x-0 bottom-0 bg-background/95 backdrop-blur-md p-3 flex justify-between items-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 border-t border-border/50">
                             <div className="flex items-center gap-2 overflow-hidden">
                               {isImage ? <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" /> : <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />}
                               <span className="text-xs truncate font-medium">{file.name}</span>
                             </div>
                             <div className="flex gap-1 shrink-0">
                               {(user?.role === "admin" || user?.role === "staff") && (
                                 <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => deleteCompletionFile(file.id)}>
                                   <Trash2 className="h-3 w-3" />
                                 </Button>
                               )}
                               <Button size="icon" variant="secondary" className="h-7 w-7" asChild>
                                 <a href={file.url} download><Download className="h-3 w-3" /></a>
                               </Button>
                             </div>
                           </div>
                         </div>
                       )
                    })}
                 </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{project.status === "completed" ? "Edit Project Output" : "Complete Project"}</DialogTitle>
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
            <Button disabled={!completionNotes.trim()} onClick={submitCompletion}>Submit & Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
