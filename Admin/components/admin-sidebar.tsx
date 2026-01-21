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
  Palette,
  Award, // New Icon
  CircleDotDashed, // New Icon for Wheel Game
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const mainNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
]

const luckyGridNavItems = [
  { href: "/game-details", label: "Game Details", icon: Gamepad2 },
  { href: "/create-game", label: "Create Game", icon: PlusCircle },
  { href: "/game-history", label: "Game History", icon: History },
]

const wheelGameNavItems = [
  { href: "/wheel-rewards", label: "Wheel Rewards", icon: Award },
]

const otherNavItems = [
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

  const renderLink = (item: { href: string; label: string; icon: React.ElementType }) => {
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
  }
  
  const getActiveAccordionValue = () => {
    if (luckyGridNavItems.some(item => pathname === item.href)) return "lucky-grid";
    if (wheelGameNavItems.some(item => pathname === item.href)) return "wheel-game";
    return "";
  }

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
        {mainNavItems.map(renderLink)}

        {/* Game sections, conditional rendering */}
        {collapsed ? (
          <>
            <div className="my-2 border-b border-sidebar-border/50" />
            {luckyGridNavItems.map(renderLink)}
            <div className="my-2 border-b border-sidebar-border/50" />
            {wheelGameNavItems.map(renderLink)}
          </>
        ) : (
          <Accordion type="single" collapsible defaultValue={getActiveAccordionValue()} className="w-full">
            {/* Lucky Grid Section */}
            <AccordionItem value="lucky-grid" className="border-none">
              <AccordionTrigger className="py-2.5 px-3 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:no-underline hover:bg-sidebar-accent hover:text-sidebar-foreground">
                <div className="flex items-center gap-3">
                  <Palette className="h-5 w-5" />
                  <span>Lucky Grid</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-6 pb-1">
                {luckyGridNavItems.map(renderLink)}
              </AccordionContent>
            </AccordionItem>

            {/* Wheel Game Section */}
            <AccordionItem value="wheel-game" className="border-none">
              <AccordionTrigger className="py-2.5 px-3 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:no-underline hover:bg-sidebar-accent hover:text-sidebar-foreground">
                <div className="flex items-center gap-3">
                  <CircleDotDashed className="h-5 w-5" />
                  <span>Wheel Game</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-6 pb-1">
                {wheelGameNavItems.map(renderLink)}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        
        {/* Separator and other items, rendered in both modes */}
        <div className="my-2 border-b border-sidebar-border/50" />
        {otherNavItems.map(renderLink)}
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
        className="absolute -right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-primary hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  )
}