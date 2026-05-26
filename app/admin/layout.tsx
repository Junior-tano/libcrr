"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useStore } from "@/lib/store"
import {
  Mic,
  Video,
  BookOpen,
  Book,
  ShoppingCart,
  Settings,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  Image
} from "lucide-react"

const navigation = [
  { name: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
  { name: "Hero Section", href: "/admin/hero", icon: Image },
  { name: "Programmes", href: "/admin/programs", icon: Calendar },
  { name: "Podcasts", href: "/admin/podcasts", icon: Mic },
  { name: "Enseignements", href: "/admin/videos", icon: Video },
  { name: "E-books", href: "/admin/ebooks", icon: BookOpen },
  { name: "Livres physiques", href: "/admin/books", icon: Book },
  { name: "Commandes", href: "/admin/orders", icon: ShoppingCart },
  { name: "Parametres", href: "/admin/settings", icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const { 
    isAdminAuthenticated, 
    adminEmail, 
    logout, 
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    loadApiData
  } = useStore()

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    setMounted(true)
    loadApiData()
  }, [loadApiData])

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return null
  }

  // Allow access to login page without authentication
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  // Redirect to login if not authenticated
  if (!isAdminAuthenticated) {
    router.push("/admin/login")
    return null
  }

  const handleLogout = () => {
    logout()
    router.push("/admin/login")
  }

  const handleNotificationClick = (notificationId: string, orderId?: string) => {
    markNotificationRead(notificationId)
    if (orderId) {
      router.push("/admin/orders")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CCR</span>
            </div>
            <span className="font-semibold text-sm">Administration</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
                {item.name === "Commandes" && unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-auto text-xs h-5 min-w-[20px] flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-2">
          <div className="px-3 py-2 text-xs text-sidebar-foreground/60">
            Connecte: {adminEmail}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            Deconnexion
          </button>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <Book className="h-5 w-5" />
            Voir le site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-4 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center text-xs px-1"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {notifications.length > 0 && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={markAllNotificationsRead}
                    >
                      <CheckCheck className="h-3 w-3 mr-1" />
                      Tout lire
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-destructive hover:text-destructive"
                      onClick={clearNotifications}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ScrollArea className="h-[300px]">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Aucune notification
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={cn(
                        "flex flex-col items-start gap-1 p-3 cursor-pointer",
                        !notification.read && "bg-primary/5"
                      )}
                      onClick={() => handleNotificationClick(notification.id, notification.orderId)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          notification.type === 'order' ? 'bg-primary' : 
                          notification.type === 'payment' ? 'bg-green-500' : 'bg-blue-500'
                        )} />
                        <span className="font-medium text-sm flex-1">{notification.title}</span>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-destructive" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground pl-4">{notification.message}</p>
                      <p className="text-xs text-muted-foreground/60 pl-4">
                        {new Date(notification.createdAt).toLocaleString('fr-FR')}
                      </p>
                    </DropdownMenuItem>
                  ))
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-medium">AD</span>
            </div>
            <span className="text-sm font-medium hidden sm:block">Admin</span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8 bg-muted/30 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  )
}
