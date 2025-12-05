"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Gamepad2,
  PlusCircle,
  History,
  CreditCard,
  Gift,
  Ticket,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/game-details", label: "Game Details", icon: Gamepad2 },
  { href: "/create-game", label: "Create Game", icon: PlusCircle },
  { href: "/game-history", label: "Game History", icon: History },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/give-tokens", label: "Give Tokens", icon: Gift },
]

interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <div className={cn("flex items-center gap-2", collapsed && "justify-center w-full")}>
          <User className="h-8 w-8 text-sidebar-primary flex-shrink-0" />
          {!collapsed && <span className="text-xl font-bold text-sidebar-foreground">Admin</span>}
        </div>
      </div>

      <nav className="flex flex-col gap-1 p-2 flex-grow">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto p-2">
        <Button
          onClick={logout}
          variant="ghost"
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors justify-start",
            collapsed && "justify-center px-2",
            "text-red-500 hover:bg-red-500/10 hover:text-red-600"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>

      <button
        onClick={onToggle}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-primary hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>)}