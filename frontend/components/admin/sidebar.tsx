"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, ShoppingCart, FileText, LogOut, Truck } from "lucide-react"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
  userName: string
}

export function Sidebar({ activeTab, onTabChange, onLogout, userName, className, onNavigate }: SidebarProps & { className?: string, onNavigate?: () => void }) {
  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "sales", label: "Sales History", icon: ShoppingCart },
    { id: "audit", label: "Audit Logs", icon: FileText },
    { id: "wholesalers", label: "Wholesalers", icon: Truck },
  ]

  const handleTabChange = (id: string) => {
    onTabChange(id)
    onNavigate?.()
  }

  return (
    <div className={cn("flex h-full w-64 flex-col border-r border-border bg-card", className)}>
      <div className="flex h-14 items-center gap-2 border-b bg-muted/40 px-6">
        <LayoutDashboard className="size-6 text-primary" />
        <div className="flex flex-col">
          <h1 className="font-mono text-xl font-bold text-foreground">Jack-VET</h1>
          <p className="text-[10px] text-muted-foreground">Admin Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "w-full justify-start gap-3 text-foreground",
                activeTab === tab.id &&
                "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
              )}
            >
              <Icon className="size-5" />
              {tab.label}
            </Button>
          )
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="mb-4 rounded-lg bg-secondary p-3">
          <p className="text-xs text-muted-foreground">Logged in as</p>
          <p className="font-semibold text-foreground">{userName}</p>
        </div>
        <Button
          variant="outline"
          onClick={onLogout}
          className="w-full justify-start gap-3 border-border bg-transparent text-foreground"
        >
          <LogOut className="size-5" />
          Logout
        </Button>
      </div>
    </div >
  )
}
