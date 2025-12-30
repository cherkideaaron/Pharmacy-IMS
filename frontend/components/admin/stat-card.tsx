"use client"

import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  onClick?: () => void
  className?: string
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, onClick, className }: StatCardProps) {
  return (
    <Card
      className={`border-border bg-card p-6 ${className || ""} ${onClick ? "cursor-pointer transition-colors hover:bg-accent" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="font-mono text-3xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="rounded-lg bg-secondary p-3">
          <Icon className="size-6 text-foreground" />
        </div>
      </div>
      {trend && trendValue && (
        <div className="mt-4 flex items-center gap-1 text-sm">
          <span
            className={
              trend === "up" ? "text-green-500" : trend === "down" ? "text-destructive" : "text-muted-foreground"
            }
          >
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
          </span>
          <span className="text-muted-foreground">vs last period</span>
        </div>
      )}
    </Card>
  )
}
