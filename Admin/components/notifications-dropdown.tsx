"use client"

import { useEffect, useState, useCallback } from "react"
import { Bell, Info, CheckCircle, AlertTriangle, XCircle, Check, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { DropdownMenuItem, DropdownMenuSeparator } from "./ui/dropdown-menu"
import { supabase } from "@/lib/supabaseClient" // Import Supabase client

// Define the Notification interface to match the database schema
interface Notification {
  id: string
  created_at: string // TIMESTAMPTZ from Supabase
  title: string
  message: string | null
  type: "info" | "success" | "warning" | "error"
  read: boolean
}

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
}

const colorMap = {
  info: "text-blue-500",
  success: "text-green-500",
  warning: "text-amber-500",
  error: "text-red-500",
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated, logout } = useAuth()

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("sb_admin_token")
      if (!token) {
        throw new Error("Authentication token not found.")
      }

      const res = await fetch("/api/admin/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to fetch notifications.")
      }

      const data: Notification[] = await res.json()
      setNotifications(data)
    } catch (err: any) {
      setError(err.message)
      console.error("Error fetching notifications:", err)
    } finally {
      setLoading(false)
    }
  }, []) // No dependencies means this function won't change on re-renders,
       // preventing infinite loops in useEffect below.

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]) // Clear notifications if not authenticated
      setLoading(false)
      return
    }

    fetchNotifications()

    // Setup Supabase Realtime Subscription
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
        // When a new notification is inserted, add it to the state
        // Ensure the new notification is cast to the correct type
        const newNotification = payload.new as Notification;
        setNotifications(prev => [newNotification, ...prev]);
      })
      .subscribe();

    return () => {
      // Cleanup subscription on component unmount or isAuthenticated change
      channel.unsubscribe();
    };
  }, [isAuthenticated, fetchNotifications]) // Re-run effect when authentication status or fetchNotifications changes

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("sb_admin_token")
      if (!token) {
        throw new Error("Authentication token not found.")
      }

      const res = await fetch("/api/admin/notifications/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: [id] }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to mark notification as read.")
      }

      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch (err: any) {
      setError(err.message)
      console.error("Error marking notification as read:", err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotificationIds = notifications.filter(n => !n.read).map(n => n.id)

      if (unreadNotificationIds.length === 0) return; // No unread to mark

      const token = localStorage.getItem("sb_admin_token")
      if (!token) {
        throw new Error("Authentication token not found.")
      }

      const res = await fetch("/api/admin/notifications/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: unreadNotificationIds }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to mark all notifications as read.")
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (err: any) {
      setError(err.message)
      console.error("Error marking all notifications as read:", err)
    }
  }

  if (loading) {
    return (
        <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-muted-foreground animate-pulse" />
        </Button>
    )
  }

  if (error) {
    return (
        <Button variant="ghost" size="icon" className="relative text-destructive">
            <Bell className="h-5 w-5" />
        </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative cursor-pointer">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h4 className="font-semibold text-foreground">Notifications</h4>
            <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-primary hover:text-primary/80"
            >
              <Check className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          <div className="flex flex-col">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No notifications</div>
            ) : (
              notifications.map((notification) => {
                const Icon = iconMap[notification.type]
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-muted/50",
                      !notification.read && "bg-primary/5",
                    )}
                  >
                    <div className={cn("mt-0.5", colorMap[notification.type])}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{notification.title}</p>
                        {!notification.read && (
                          <Badge className="bg-primary/20 text-primary text-[10px] px-1.5 py-0">New</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                      >
                        Read
                      </Button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
