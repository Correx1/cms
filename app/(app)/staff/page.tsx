"use client"

import { useAuth } from "@/lib/auth-context"
import { mockStaff, Staff } from "@/lib/mock/staff"
import { mockProjects } from "@/lib/mock/projects"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, UserCog, User, MoreHorizontal, ChevronDown, ListChecks, Edit, Ban } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function StaffPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  // Local state for CRUD operations to function perfectly
  const [staffList, setStaffList] = useState<(Staff & { isActive?: boolean })[]>(
    mockStaff.map(s => ({ ...s, isActive: true }))
  )
  
  // Dialog States
  const [editStaff, setEditStaff] = useState<Staff | null>(null)
  const [editFormData, setEditFormData] = useState({ name: "", email: "", role: "" })

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <h2 className="text-2xl font-bold">Unauthorized</h2>
        <p className="text-muted-foreground mt-2">Only administrators can view and manage staff.</p>
        <Button className="mt-6" onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  // Handle Edit Action
  const handleOpenEdit = (staff: Staff) => {
    setEditStaff(staff)
    setEditFormData({ name: staff.name, email: staff.email, role: staff.role })
  }

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editStaff) return
    setStaffList(prev => prev.map(s => 
      s.id === editStaff.id ? { ...s, name: editFormData.name, email: editFormData.email, role: editFormData.role as "admin"|"staff" } : s
    ))
    setEditStaff(null)
  }

  // Handle Deactivate Action
  const toggleDeactivate = (id: string, currentlyActive: boolean) => {
    setStaffList(prev => prev.map(s => s.id === id ? { ...s, isActive: !currentlyActive } : s))
  }

  // Derived Project Arrays per Staff
  const getStaffProjects = (staffId: string) => {
    const assigned = mockProjects.filter(p => p.assignedStaffIds.includes(staffId) && p.status !== "completed")
    const completed = mockProjects.filter(p => p.assignedStaffIds.includes(staffId) && p.status === "completed")
    return { assigned, completed }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Staff Directory</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Manage agency teams and administrator accounts.</p>
        </div>
        <Button className="shadow-sm shadow-primary/20 w-full sm:w-auto" asChild>
          <Link href="/users/new">
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="py-4 border-b border-border/50 bg-card rounded-t-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-base md:text-lg font-medium flex items-center gap-2">
              <UserCog className="h-5 w-5 text-muted-foreground" />
              Organizational Chart
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search staff members..."
                className="w-full pl-9 bg-background/50 h-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/50">
                  <TableHead className="w-[250px] py-4 pl-6 text-sm">Name & Identity</TableHead>
                  <TableHead className="py-4 text-sm hidden sm:table-cell">Job / Role</TableHead>
                  <TableHead className="py-4 text-sm hidden md:table-cell">Projects Assigned</TableHead>
                  <TableHead className="py-4 text-sm hidden lg:table-cell">Projects Completed</TableHead>
                  <TableHead className="py-4 pr-6 text-right text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffList.map(staff => {
                  const { assigned, completed } = getStaffProjects(staff.id)
                  // Derive "Job" from their name temporarily for realism since the object only holds "role"
                  const mockJobTitle = staff.name.split(" ")[1] || (staff.role === "admin" ? "Director" : "Specialist")
                  const isDeactivated = !staff.isActive

                  return (
                    <TableRow key={staff.id} className={`border-border/50 group hover:bg-muted/30 transition-colors ${isDeactivated ? "opacity-50" : ""}`}>
                      <TableCell className="font-medium pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ring-1 ring-border shadow-sm ${isDeactivated ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                            {staff.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-base font-semibold leading-tight">{staff.name} {isDeactivated && "(Inactive)"}</span>
                            <span className="text-sm text-muted-foreground font-medium">{staff.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-4 hidden sm:table-cell">
                        <div className="flex flex-col items-start gap-1.5">
                          <span className="font-medium text-sm">{mockJobTitle}</span>
                          <Badge variant={staff.role === "admin" ? "default" : "secondary"} className="text-[10px] uppercase px-1.5 py-0 shadow-sm">
                            {staff.role}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-4 hidden md:table-cell align-top">
                        {assigned.length > 0 ? (
                          <div className="flex flex-col gap-1 w-[200px]">
                            {assigned.slice(0, 3).map(p => (
                              <span key={p.id} className="text-xs truncate bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md font-medium">
                                • {p.title}
                              </span>
                            ))}
                            {assigned.length > 3 && <span className="text-xs text-muted-foreground pl-2">+{assigned.length - 3} more...</span>}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">None active</span>
                        )}
                      </TableCell>

                      <TableCell className="py-4 hidden lg:table-cell align-top">
                        {completed.length > 0 ? (
                          <div className="flex flex-col gap-1 w-[200px]">
                            {completed.slice(0, 3).map(p => (
                              <span key={p.id} className="text-xs truncate bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-medium">
                                ✓ {p.title}
                              </span>
                            ))}
                            {completed.length > 3 && <span className="text-xs text-muted-foreground pl-2">+{completed.length - 3} more...</span>}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">0 completed</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right pr-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 shadow-sm">
                              <ListChecks className="mr-2 h-4 w-4 hidden sm:block" />
                              <span className="">Options</span>
                              <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[180px]">
                            <DropdownMenuItem className="cursor-pointer" asChild>
                              <Link href={`/staff/${staff.id}`}><User className="mr-2 h-4 w-4" /> View Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleOpenEdit(staff)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className={`cursor-pointer font-semibold ${isDeactivated ? 'text-primary' : 'text-destructive'}`}
                              onClick={() => toggleDeactivate(staff.id, !isDeactivated)}
                            >
                              <Ban className="mr-2 h-4 w-4" /> {isDeactivated ? 'Reactivate User' : 'Deactivate User'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Inline Edit Form Dialog */}
      <Dialog open={!!editStaff} onOpenChange={(open) => !open && setEditStaff(null)}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={submitEdit}>
            <DialogHeader>
              <DialogTitle>Edit Staff Profile</DialogTitle>
              <DialogDescription>
                Make changes to {editStaff?.name}&apos;s account details. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Admin Capabilities</Label>
                <select 
                  id="role"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={editFormData.role}
                  onChange={e => setEditFormData({...editFormData, role: e.target.value})}
                  required
                >
                  <option value="staff" className="bg-background">Standard Staff</option>
                  <option value="admin" className="bg-background">Administrator</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditStaff(null)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
