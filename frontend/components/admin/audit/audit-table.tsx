"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AuditLog } from "@/lib/types"
import { Search, ShoppingCart, Package, Plus, Edit, LogIn, LogOut, Activity } from "lucide-react"

interface AuditTableProps {
  logs: AuditLog[]
}

const actionIcons = {
  sale: ShoppingCart,
  stock_adjustment: Package,
  product_added: Plus,
  product_updated: Edit,
  login: LogIn,
  logout: LogOut,
}

const actionColors = {
  sale: "bg-green-500/10 text-green-500 border-green-500/20",
  stock_adjustment: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  product_added: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  product_updated: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  login: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  logout: "bg-gray-500/10 text-gray-400 border-gray-500/20",
}

export function AuditTable({ logs }: AuditTableProps) {
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  const filteredLogs = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    return logs
      .filter((log) => {
        const matchesSearch =
          log.userName.toLowerCase().includes(search.toLowerCase()) ||
          log.details.toLowerCase().includes(search.toLowerCase()) ||
          log.action.toLowerCase().includes(search.toLowerCase())

        const matchesAction = actionFilter === "all" || log.action === actionFilter

        const logDate = new Date(log.timestamp)
        const matchesDate =
          dateFilter === "all" ||
          (dateFilter === "today" && logDate >= today) ||
          (dateFilter === "week" && logDate >= weekAgo)

        return matchesSearch && matchesAction && matchesDate
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [logs, search, actionFilter, dateFilter])

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search logs by user, action, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-border text-foreground"
          />
        </div>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[150px] bg-secondary border-border text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px] bg-secondary border-border text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="sale">Sales</SelectItem>
            <SelectItem value="stock_adjustment">Stock Adjustments</SelectItem>
            <SelectItem value="product_added">Products Added</SelectItem>
            <SelectItem value="product_updated">Products Updated</SelectItem>
            <SelectItem value="login">Logins</SelectItem>
            <SelectItem value="logout">Logouts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-foreground">Timestamp</TableHead>
              <TableHead className="text-foreground">Action</TableHead>
              <TableHead className="text-foreground">User</TableHead>
          <TableHead className="text-foreground">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No audit logs found
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => {
                const dt = formatDateTime(log.timestamp)
                const Icon = actionIcons[log.action] || Activity
                const colorClass = actionColors[log.action] || "bg-secondary text-foreground border-border"

                return (
                  <TableRow key={log.id} className="border-border hover:bg-secondary/50">
                    <TableCell>
                      <div>
                        <p className="text-sm text-foreground">{dt.date}</p>
                        <p className="font-mono text-xs text-muted-foreground">{dt.time}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`flex w-fit items-center gap-1.5 ${colorClass}`}>
                        <Icon className="size-3" />
                        <span className="capitalize">{log.action.replace("_", " ")}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">{log.userName}</TableCell>
                  <TableCell className="text-sm text-foreground">{log.details}</TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>Showing {filteredLogs.length} audit entries</p>
        <p className="flex items-center gap-2">
          <Activity className="size-4" />
          System activity log
        </p>
      </div>
    </div>
  )
}
