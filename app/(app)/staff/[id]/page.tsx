"use client"

import { useAuth } from "@/lib/auth-context"
import { mockStaff } from "@/lib/mock/staff"
import { mockProjects } from "@/lib/mock/projects"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Mail, Shield, CheckCircle2, FolderKanban, Briefcase } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

export default function StaffProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const staffId = params?.id as string
  
  const staff = mockStaff.find(s => s.id === staffId)
  
  if (!staff) {
    return <div className="p-8 text-center text-muted-foreground">Staff member not found.</div>
  }

  const assignedProjects = mockProjects.filter(p => p.assignedStaffIds.includes(staff.id) && p.status !== "completed")
  const completedProjects = mockProjects.filter(p => p.assignedStaffIds.includes(staff.id) && p.status === "completed")

  const mockJobTitle = staff.name.split(" ")[1] || (staff.role === "admin" ? "Director" : "Specialist")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Go Back</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Profile</h1>
          <p className="text-muted-foreground mt-1">Viewing organizational details and project assignments.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Identity details */}
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-sm border-border/50">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl ring-4 ring-primary/5 shadow-sm mb-4">
                {staff.name.split(" ").map(n => n[0]).join("")}
              </div>
              <h2 className="text-xl font-bold">{staff.name}</h2>
              <p className="text-muted-foreground font-medium flex items-center gap-1.5 mt-1">
                <Briefcase className="h-4 w-4" /> {mockJobTitle}
              </p>
              
              <div className="w-full border-t border-border/50 mt-6 pt-6 space-y-4 text-left">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Email Address</span>
                  <div className="flex items-center text-sm font-medium">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    {staff.email}
                  </div>
                </div>
                <div className="space-y-1 pt-2 border-t border-border/50">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">System Privileges</span>
                  <div className="flex items-center mt-1">
                    <Badge variant={staff.role === "admin" ? "default" : "secondary"} className="capitalize">
                      <Shield className="mr-1.5 h-3 w-3" />
                      {staff.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Projects */}
        <div className="md:col-span-2 space-y-6">
          
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-primary" /> Active Assignments
              </CardTitle>
              <CardDescription>Projects currently being managed by {staff.name}.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {assignedProjects.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {assignedProjects.map(p => (
                    <Link key={p.id} href={`/projects/${p.id}`} className="block">
                      <div className="border border-border/50 rounded-lg p-3 hover:bg-muted/30 transition-colors shadow-sm bg-card group">
                        <div className="font-semibold group-hover:text-primary transition-colors">{p.title}</div>
                        <div className="text-sm text-muted-foreground mt-1 flex items-center justify-between">
                          <span>Deadline: {new Date(p.deadline).toLocaleDateString()}</span>
                          <Badge variant="outline" className="capitalize text-[10px]">{p.status}</Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed rounded-lg bg-muted/20">
                  <FolderKanban className="h-8 w-8 mx-auto mb-2 opacity-20 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">No active assignments</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50 opacity-90">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" /> Historical Completions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {completedProjects.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {completedProjects.map(p => (
                    <Link key={p.id} href={`/projects/${p.id}`} className="block">
                      <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-lg p-3 hover:bg-emerald-500/10 transition-colors">
                        <div className="font-semibold text-emerald-700 dark:text-emerald-300">{p.title}</div>
                        <div className="text-sm text-emerald-600/70 dark:text-emerald-400/70 mt-1">Completed successfully</div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No completed projects on record.</p>
              )}
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  )
}
