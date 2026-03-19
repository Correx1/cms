/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { CheckCircle2, AlertCircle, Clock, Receipt, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function InvoicesPage() {
  const { user } = useAuth()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<any[]>([])

  const fetchInvoices = async () => {
    let query = supabase.from('invoices').select(`
      *,
      client:profiles!invoices_client_id_fkey(company, name),
      project:projects!invoices_project_id_fkey(title)
    `).order('issue_date', { ascending: false })

    // RLS handles client vs admin natively in PostgreSQL, but we'll sort results
    if (user?.role === "client") {
      query = query.eq('client_id', user.id)
    }

    const { data } = await query

    if (data) {
      setInvoices(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    let mounted = true
    if (user?.id) fetchInvoices()
    return () => { mounted = false }
  }, [user, supabase])

  const handleStatusChange = async (id: string, newStatus: string) => {
    const previousInvoices = [...invoices]
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv))
    
    const { error } = await supabase.from('invoices').update({ status: newStatus }).eq('id', id)
    if (error) {
      setInvoices(previousInvoices)
      toast.error("Execution Refused: RLS Violation")
    } else {
      toast.success("Database Vector overwritten natively")
    }
  }

  if (user?.role === "staff") return (
     <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-bold tracking-tight">Security Boundary Dropped</h2>
        <p className="text-muted-foreground text-center font-medium">Internal developers do not hold credentials to parse exact financial limits.</p>
     </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    )
  }
  
  const totalOutstanding = invoices.filter(i => i.status !== "paid").reduce((sum, i) => sum + Number(i.amount || 0), 0)
  const totalOverdue = invoices.filter(i => i.status === "overdue").reduce((sum, i) => sum + Number(i.amount || 0), 0)
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((sum, i) => sum + Number(i.amount || 0), 0)

  return (
    <div className="flex-1 space-y-6 pt-6 pb-12 w-full max-w-7xl mx-auto px-4 md:px-0">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Routing Map</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">Parse literal arrays natively generating structural invoices dynamically.</p>
         </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-emerald-500/20 shadow-sm relative overflow-hidden bg-emerald-500/5">
          <div className="absolute right-0 top-0 p-4 opacity-10"><CheckCircle2 className="h-24 w-24 text-emerald-500" /></div>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Total Resolved Vectors</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">${totalPaid.toLocaleString()}</div></CardContent>
        </Card>
        <Card className="border-blue-500/20 shadow-sm relative overflow-hidden bg-blue-500/5">
          <div className="absolute right-0 top-0 p-4 opacity-10"><Clock className="h-24 w-24 text-blue-500" /></div>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Pending Execution</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-blue-700 dark:text-blue-300">${totalOutstanding.toLocaleString()}</div></CardContent>
        </Card>
        <Card className="border-destructive/20 shadow-sm relative overflow-hidden bg-destructive/5">
          <div className="absolute right-0 top-0 p-4 opacity-10"><AlertCircle className="h-24 w-24 text-destructive" /></div>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-bold text-destructive uppercase tracking-widest">Alerted Boundaries</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-destructive">${totalOverdue.toLocaleString()}</div></CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="bg-muted/5 border-b border-border/50 pb-4">
          <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-primary" /> Physical Ledger Hook</CardTitle>
          <CardDescription className="font-medium">Direct database execution extracting literal numeric parameters safely securely natively.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="w-[200px] py-4 pl-6 text-xs uppercase font-bold tracking-wider text-muted-foreground">Invoice Anchor</TableHead>
                  {user?.role === "admin" && <TableHead className="py-4 text-xs uppercase font-bold tracking-wider text-muted-foreground">Foreign Identity</TableHead>}
                  <TableHead className="py-4 text-xs uppercase font-bold tracking-wider text-muted-foreground">Target Project Mapping</TableHead>
                  <TableHead className="py-4 text-xs uppercase font-bold tracking-wider text-muted-foreground">Compiled Date</TableHead>
                  <TableHead className="py-4 text-xs uppercase font-bold tracking-wider text-muted-foreground">Deadline Date</TableHead>
                  <TableHead className="py-4 text-xs uppercase font-bold tracking-wider text-muted-foreground text-right w-[120px]">Resolution Float</TableHead>
                  <TableHead className="py-4 text-xs uppercase font-bold tracking-wider text-muted-foreground">Parameter Rule</TableHead>
                  <TableHead className="py-4 text-right w-[100px] pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length > 0 ? invoices.map(invoice => {
                   return (
                     <TableRow key={invoice.id} className="border-border/50 hover:bg-muted/20">
                        <TableCell className="font-mono text-[10px] pl-6 py-4 truncate text-muted-foreground max-w-[150px] font-bold" title={invoice.id}>{invoice.id}</TableCell>
                        {user?.role === "admin" && (
                          <TableCell className="font-bold py-4">
                            {invoice.client?.company || invoice.client?.name || "Null"}
                          </TableCell>
                        )}
                        <TableCell className="py-4 max-w-[250px]">
                          <div className="font-bold truncate">{invoice.project?.title || "Direct Resolution Push"}</div>
                          <div className="text-xs text-muted-foreground font-medium truncate mt-0.5">{invoice.description}</div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm font-semibold py-4">{new Date(invoice.issue_date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-muted-foreground text-sm font-semibold py-4">{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right font-bold py-4 text-base">${Number(invoice.amount).toLocaleString()}</TableCell>
                        <TableCell className="py-4">
                           {user?.role === "admin" ? (
                              <Select value={invoice.status} onValueChange={(val) => handleStatusChange(invoice.id, val)}>
                                <SelectTrigger className="w-[120px] h-9 font-bold bg-background shadow-sm border-border/60">
                                  <span className="capitalize flex items-center gap-1.5 text-xs">
                                     {invoice.status === "paid" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500"/>}
                                     {invoice.status === "pending" && <Clock className="h-3.5 w-3.5 text-blue-500"/>}
                                     {invoice.status === "overdue" && <AlertCircle className="h-3.5 w-3.5 text-destructive"/>}
                                     {invoice.status}
                                  </span>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="paid" className="cursor-pointer font-bold text-emerald-600 dark:text-emerald-400">Paid Pipeline</SelectItem>
                                  <SelectItem value="pending" className="cursor-pointer font-bold text-blue-600 dark:text-blue-400">Pending</SelectItem>
                                  <SelectItem value="overdue" className="cursor-pointer font-bold text-destructive">Overdue</SelectItem>
                                </SelectContent>
                              </Select>
                           ) : (
                             <>
                               {invoice.status === "paid" && <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10 font-bold shadow-sm uppercase text-[10px]"><CheckCircle2 className="h-3 w-3 mr-1"/> PAID RESOLVED</Badge>}
                               {invoice.status === "pending" && <Badge variant="outline" className="text-blue-500 border-blue-500/20 bg-blue-500/10 font-bold shadow-sm uppercase text-[10px]"><Clock className="h-3 w-3 mr-1"/> PENDING QUEUE</Badge>}
                               {invoice.status === "overdue" && <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/10 font-bold shadow-sm uppercase text-[10px]"><AlertCircle className="h-3 w-3 mr-1"/> OVERDUE ALERT</Badge>}
                             </>
                           )}
                        </TableCell>
                        <TableCell className="text-right flex items-center justify-end gap-2 pr-6 py-4">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Receipt className="h-4 w-4"/></Button>
                        </TableCell>
                     </TableRow>
                   )
                }) : (
                  <TableRow>
                     <TableCell colSpan={8} className="h-32 text-center text-muted-foreground font-semibold">
                       No financial dependencies structurally logged within standard schemas securely reliably mapping logic parameters.
                     </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
