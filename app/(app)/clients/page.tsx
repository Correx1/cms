"use client"

import { useAuth } from "@/lib/auth-context"
import { mockClients, Client } from "@/lib/mock/clients"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Users, Search, ChevronDown, ListChecks, Edit, Ban, Building2 } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function ClientsPage() {
  const { user } = useAuth()
  
  // Local state for CRUD operations
  const [clientList, setClientList] = useState<(Client & { isActive?: boolean })[]>(
    mockClients.map(c => ({ ...c, isActive: true }))
  )
  
  // Dialog States
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [editFormData, setEditFormData] = useState({ name: "", company: "", email: "", phone: "" })

  const handleOpenEdit = (client: Client) => {
    setEditClient(client)
    setEditFormData({ name: client.name, company: client.company, email: client.email, phone: client.phone })
  }

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editClient) return
    setClientList(prev => prev.map(c => 
      c.id === editClient.id ? { ...c, ...editFormData } : c
    ))
    setEditClient(null)
  }

  const toggleDeactivate = (id: string, currentlyActive: boolean) => {
    setClientList(prev => prev.map(c => c.id === id ? { ...c, isActive: !currentlyActive } : c))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Clients Directory</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Manage your agency&apos;s clients and their contact information.</p>
        </div>
        {user?.role === "admin" && (
          <Button className="shadow-sm shadow-primary/20 w-full sm:w-auto" asChild>
            <Link href="/clients/new">
              <Plus className="mr-2 h-4 w-4" /> Add Client
            </Link>
          </Button>
        )}
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="py-4 border-b border-border/50 bg-card rounded-t-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-base md:text-lg font-medium flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              Client Database
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search clients..."
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
                  <TableHead className="w-[300px] py-4 pl-6 text-sm">Client Name</TableHead>
                  <TableHead className="py-4 text-sm">Company</TableHead>
                  <TableHead className="py-4 hidden md:table-cell text-sm">Email</TableHead>
                  <TableHead className="py-4 hidden lg:table-cell text-sm">Phone</TableHead>
                  <TableHead className="py-4 text-center text-sm">Projects</TableHead>
                  <TableHead className="py-4 pr-6 text-right text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientList.length > 0 ? clientList.map(client => {
                  const isDeactivated = !client.isActive

                  return (
                    <TableRow key={client.id} className={`border-border/50 group hover:bg-muted/30 transition-colors ${isDeactivated ? "opacity-50" : ""}`}>
                      <TableCell className="font-medium pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ring-1 ring-border shadow-sm ${isDeactivated ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                            {client.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-base font-semibold leading-tight">{client.name} {isDeactivated && "(Inactive)"}</span>
                            <span className="text-xs text-muted-foreground md:hidden">{client.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-sm font-medium">
                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {client.company}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell text-sm font-medium py-4">{client.email}</TableCell>
                      <TableCell className="text-muted-foreground hidden lg:table-cell text-sm font-medium py-4">{client.phone}</TableCell>
                      <TableCell className="text-center py-4">
                        <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm mx-auto py-1 px-3 rounded-md w-fit font-semibold border border-blue-500/20 shadow-sm">
                          {client.projectCount}
                        </div>
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
                              <Link href={`/clients/${client.id}`}><Users className="mr-2 h-4 w-4" /> View Profile</Link>
                            </DropdownMenuItem>
                            {user?.role === "admin" && (
                              <>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => handleOpenEdit(client)}>
                                  <Edit className="mr-2 h-4 w-4" /> Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className={`cursor-pointer font-semibold ${isDeactivated ? 'text-primary' : 'text-destructive'}`}
                                  onClick={() => toggleDeactivate(client.id, !isDeactivated)}
                                >
                                  <Ban className="mr-2 h-4 w-4" /> {isDeactivated ? 'Reactivate' : 'Deactivate'}
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                }) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground text-base">
                      No clients found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Inline Edit Form Dialog */}
      <Dialog open={!!editClient} onOpenChange={(open) => !open && setEditClient(null)}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={submitEdit}>
            <DialogHeader>
              <DialogTitle>Edit Client Overview</DialogTitle>
              <DialogDescription>
                Make changes to primary contact and demographic information. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} required className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company Entity</Label>
                <Input id="company" value={editFormData.company} onChange={e => setEditFormData({...editFormData, company: e.target.value})} required className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} required className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} className="bg-background/50" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditClient(null)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
