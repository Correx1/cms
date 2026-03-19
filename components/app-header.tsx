"use client"

import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "./theme-toggle"
import Image from "next/image"
import { Bell, Menu, CheckCircle2, AlertCircle, Info, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { AppSidebar } from "./app-sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { mockNotifications } from "@/lib/mock/notifications"

export function AppHeader() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b border-primary-foreground/10 bg-primary text-primary-foreground px-4 lg:px-6 w-full shadow-md z-10 transition-colors duration-300">
      <div className="flex-1 flex items-center justify-between">
        
        {/* Mobile Sidebar Toggle & Logo */}
        <div className="flex items-center gap-3 md:hidden">
          <Sheet>
            <SheetTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md transition-colors disabled:pointer-events-none disabled:opacity-50 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground focus:ring-primary-foreground/50 h-9 w-9">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Sidebar</span>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-none w-64">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <AppSidebar mobile />
            </SheetContent>
          </Sheet>
          
          <Image src="/logo.png" alt="Agency Logo" width={100} height={32} className="object-contain h-7 w-auto brightness-0 invert" />
        </div>

        {/* Desktop Header Left Side (Empty on Desktop, Sidebar handles logo) */}
        <div className="hidden md:block flex-1">
           {/* Can optionally add breadcrumbs here */}
        </div>
        
        <div className="flex items-center gap-4">
          {user.role !== "client" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  {mockNotifications.some(n => !n.read) && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border-[1.5px] border-background" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="font-semibold text-sm">Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                  {mockNotifications.map(n => (
                     <DropdownMenuItem key={n.id} className="flex flex-col items-start p-3 gap-1 cursor-pointer hover:bg-muted/50 focus:bg-muted/50 rounded-none relative">
                        {!n.read && <div className="absolute left-1 top-4 h-1.5 w-1.5 rounded-full bg-blue-500" />}
                        <div className="flex justify-between w-full items-center pl-3">
                          <span className="font-medium text-sm flex items-center gap-1.5">
                            {n.type === "success" && <CheckCircle2 className="h-3 w-3 text-emerald-500"/>}
                            {n.type === "alert" && <AlertCircle className="h-3 w-3 text-destructive"/>}
                            {n.type === "system" && <Info className="h-3 w-3 text-blue-500"/>}
                            {n.type === "message" && <MessageSquare className="h-3 w-3 text-muted-foreground"/>}
                            {n.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{n.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 pl-3">{n.message}</p>
                     </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <div className="w-full text-center p-2 text-xs font-medium text-primary hover:underline cursor-pointer">
                  Mark all as read
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <div className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
             <ThemeToggle />
          </div>
          
          <div className="flex items-center gap-3 pr-2">
            <div className="hidden sm:flex items-center gap-2 sm:gap-3">
              <span className="text-sm font-medium">{user.name}</span>
              <Badge variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 capitalize font-medium border-none px-2.5 py-0.5">
                {user.role}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
