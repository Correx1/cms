"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { mockInvoices } from "@/lib/mock/invoices"
import { mockClients } from "@/lib/mock/clients"
import { mockProjects } from "@/lib/mock/projects"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { CheckCircle2, AlertCircle, Clock, Receipt, Banknote } from "lucide-react"

export default function InvoicesPage() {
  const { user } = useAuth()
  const [localInvoices, setLocalInvoices] = useState(mockInvoices)

  const handleStatusChange = (id: string, newStatus: string) => {
     setLocalInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: newStatus as "paid" | "pending" | "overdue" } : inv))
  }
  if (user?.role === "staff" || user?.role === "client") return (
     <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold tracking-tight">Access Denied</h2>
        <p className="text-muted-foreground text-center">You don&apos;t have permission to view this directory.</p>
     </div>
  );

  const invoices = localInvoices;
  
  const totalOutstanding = invoices.filter(i => i.status !== "paid").reduce((sum, i) => sum + i.amount, 0)
  const totalOverdue = invoices.filter(i => i.status === "overdue").reduce((sum, i) => sum + i.amount, 0)
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((sum, i) => sum + i.amount, 0)

  return (
    <div className="flex-1 space-y-6 pt-6 pb-12 w-full max-w-7xl mx-auto px-4 md:px-0">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoices & Billing</h1>
            <p className="text-muted-foreground mt-1">Manage financial records and pending payments.</p>
         </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-emerald-500/20 shadow-sm relative overflow-hidden bg-emerald-500/5">
          <div className="absolute right-0 top-0 p-4 opacity-10"><CheckCircle2 className="h-24 w-24 text-emerald-500" /></div>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Total Collected</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">${totalPaid.toLocaleString()}</div></CardContent>
        </Card>
        <Card className="border-blue-500/20 shadow-sm relative overflow-hidden bg-blue-500/5">
          <div className="absolute right-0 top-0 p-4 opacity-10"><Clock className="h-24 w-24 text-blue-500" /></div>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Outstanding Balance</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-blue-700 dark:text-blue-300">${totalOutstanding.toLocaleString()}</div></CardContent>
        </Card>
        <Card className="border-destructive/20 shadow-sm relative overflow-hidden bg-destructive/5">
          <div className="absolute right-0 top-0 p-4 opacity-10"><AlertCircle className="h-24 w-24 text-destructive" /></div>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-destructive">Overdue Payments</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-destructive">${totalOverdue.toLocaleString()}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" /> Invoice History</CardTitle>
          <CardDescription>A complete log of all issued invoices and their payment status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[100px]">Invoice UI</TableHead>
                  {user?.role === "admin" && <TableHead>Client</TableHead>}
                  <TableHead>Project / Description</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map(invoice => {
                   const client = mockClients.find(c => c.id === invoice.clientId);
                   const project = mockProjects.find(p => p.id === invoice.projectId);
                   return (
                     <TableRow key={invoice.id}>
                        <TableCell className="font-medium text-xs">{invoice.id}</TableCell>
                        {user?.role === "admin" && <TableCell>{client?.company}</TableCell>}
                        <TableCell>
                          <div className="font-medium">{project?.title || "Retainer"}</div>
                          <div className="text-xs text-muted-foreground">{invoice.description}</div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right font-medium">${invoice.amount.toLocaleString()}</TableCell>
                        <TableCell>
                           {user?.role === "admin" ? (
                              <Select value={invoice.status} onValueChange={(val) => handleStatusChange(invoice.id, val)}>
                                <SelectTrigger className="w-[110px] h-8 text-xs border-primary/20">
                                  <span className="capitalize flex items-center gap-1.5">
                                     {invoice.status === "paid" && <CheckCircle2 className="h-3 w-3 text-emerald-500"/>}
                                     {invoice.status === "pending" && <Clock className="h-3 w-3 text-blue-500"/>}
                                     {invoice.status === "overdue" && <AlertCircle className="h-3 w-3 text-destructive"/>}
                                     {invoice.status}
                                  </span>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="paid">Paid</SelectItem>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="overdue">Overdue</SelectItem>
                                </SelectContent>
                              </Select>
                           ) : (
                             <>
                               {invoice.status === "paid" && <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10"><CheckCircle2 className="h-3 w-3 mr-1"/> Paid</Badge>}
                               {invoice.status === "pending" && <Badge variant="outline" className="text-blue-500 border-blue-500/20 bg-blue-500/10"><Clock className="h-3 w-3 mr-1"/> Pending</Badge>}
                               {invoice.status === "overdue" && <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/10"><AlertCircle className="h-3 w-3 mr-1"/> Overdue</Badge>}
                             </>
                           )}
                        </TableCell>
                        <TableCell className="text-right flex items-center justify-end gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary"><Receipt className="h-4 w-4"/></Button>
                        </TableCell>
                     </TableRow>
                   )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
