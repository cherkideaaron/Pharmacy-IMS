"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, ShoppingCart, FileText, LogOut } from "lucide-react"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
  userName: string
}

export function Sidebar({ activeTab, onTabChange, onLogout, userName }: SidebarProps) {
  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "sales", label: "Sales History", icon: ShoppingCart },
    { id: "audit", label: "Audit Logs", icon: FileText },
  ]

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="border-b border-border p-6">
        <h1 className="font-mono text-xl font-bold text-foreground">PharmaSys</h1>
        <p className="text-xs text-muted-foreground">Admin Dashboard</p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => onTabChange(tab.id)}
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
    </div>
  )
}
