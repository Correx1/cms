"use client"

import { mockClients } from "@/lib/mock/clients"
import { mockProjects } from "@/lib/mock/projects"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Building2, Mail, Phone, FolderKanban, Edit, CheckCircle2, Clock, Activity } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function ClientProfilePage() {
  const params = useParams()
  const clientId = params?.id as string
  
  // Mock data fetching
  const client = mockClients.find(c => c.id === clientId) || mockClients[0]
  const clientProjects = mockProjects.filter(p => p.clientId === client.id)

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "completed": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      case "active": return <Activity className="h-4 w-4 text-blue-500" />
      default: return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/clients">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Clients</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
            <p className="text-muted-foreground mt-1 text-sm">Client Profile</p>
          </div>
        </div>
        <Button variant="outline" className="shadow-sm">
          <Edit className="mr-2 h-4 w-4" /> Edit Profile
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Details */}
        <Card className="md:col-span-1 shadow-sm border-border/50 h-fit">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl ring-2 ring-primary/20">
                {client.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <CardTitle>{client.company}</CardTitle>
                <CardDescription className="uppercase mapping-widest text-[10px] tracking-wider mt-1 font-semibold text-primary/70">
                  Active Client
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 pt-4 border-t border-border/50">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${client.email}`} className="text-primary hover:underline">{client.email}</a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{client.company} HQ</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border/50">
              <div className="bg-muted/30 p-3 rounded-md border border-border/50">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Total Value Delivered</div>
                <div className="text-xl font-bold">$0.00 <span className="text-xs font-normal text-muted-foreground ml-1">(Mock Data)</span></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Linked Projects */}
        <Card className="md:col-span-2 shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Linked Projects</CardTitle>
              <CardDescription>All projects associated with this client</CardDescription>
            </div>
            <Button size="sm" asChild>
              <Link href={`/projects/new?client=${client.id}`}>
                New Project
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {clientProjects.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead>Project Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientProjects.map(project => (
                    <TableRow key={project.id} className="border-border/50 group">
                      <TableCell className="font-medium flex items-center gap-2">
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                        {project.title}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(project.status)}
                          <span className="capitalize text-sm">{project.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/projects/${project.id}`}>View Details</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 border border-dashed rounded-lg border-border/50 mt-2">
                <FolderKanban className="mx-auto h-8 w-8 text-muted-foreground opacity-50 mb-3" />
                <h3 className="text-lg font-medium">No projects found</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">This client doesn&apos;t have any projects yet.</p>
                <Button asChild>
                  <Link href={`/projects/new?client=${client.id}`}>Create their first project</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
