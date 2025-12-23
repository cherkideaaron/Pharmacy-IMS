"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Sale, Product } from "@/lib/types"
import { Search, Download, Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"

interface SalesTableProps {
  sales: Sale[]
  products: Product[]
}

export function SalesTable({ sales, products = [] }: SalesTableProps) {
  const [search, setSearch] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  const filteredSales = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(today)
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    return sales
      .filter((sale) => {
        const matchesSearch =
          sale.productName.toLowerCase().includes(search.toLowerCase()) ||
          sale.employeeName.toLowerCase().includes(search.toLowerCase()) ||
          sale.prescriptionNumber?.toLowerCase().includes(search.toLowerCase())

        const matchesPayment = paymentFilter === "all" || sale.paymentMethod === paymentFilter

        const saleDate = new Date(sale.timestamp)
        const matchesDate =
          dateFilter === "all" ||
          (dateFilter === "today" && saleDate >= today) ||
          (dateFilter === "week" && saleDate >= weekAgo) ||
          (dateFilter === "month" && saleDate >= monthAgo)

        return matchesSearch && matchesPayment && matchesDate
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [sales, search, paymentFilter, dateFilter])

  const totals = useMemo(() => {
    return filteredSales.reduce(
      (acc, sale) => {
        const product = products.find(p => p.id === sale.productId)
        // Profit = (Unit Price - Cost Price) * Quantity
        // If product missing (deleted), assume 0 cost for safety or skip profit
        const costPrice = product ? product.costPrice : 0
        const profit = (sale.unitPrice - costPrice) * sale.quantity

        return {
          revenue: acc.revenue + sale.totalAmount,
          count: acc.count + 1,
          items: acc.items + sale.quantity,
          profit: acc.profit + profit
        }
      },
      { revenue: 0, count: 0, items: 0, profit: 0 },
    )
  }, [filteredSales, products])

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    }
  }

  const handleExport = () => {
    // Define CSV headers
    const headers = ["Date", "Time", "Product", "Quantity", "Total Amount", "Payment Method", "Employee", "Prescription"]

    // Convert data to CSV rows
    const csvData = filteredSales.map(sale => {
      const dt = formatDateTime(sale.timestamp)
      return [
        dt.date,
        dt.time,
        `"${sale.productName.replace(/"/g, '""')}"`, // Handle commas/quotes in name
        sale.quantity,
        sale.totalAmount.toFixed(2),
        sale.paymentMethod,
        `"${sale.employeeName.replace(/"/g, '""')}"`,
        sale.prescriptionNumber || ""
      ].join(",")
    })

    // Combine headers and data
    const csvContent = [headers.join(","), ...csvData].join("\n")

    // Create blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `sales_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by product, employee, or prescription..."
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
            <SelectItem value="month">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-[150px] bg-secondary border-border text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="insurance">Insurance</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="border-border bg-transparent text-foreground"
          onClick={handleExport}
        >
          <Download className="mr-2 size-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="font-mono text-2xl font-bold text-foreground">${totals.revenue.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{totals.count} transactions</p>
        </Card>
        <Card className="border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Profit</p>
          <p className="font-mono text-2xl font-bold text-foreground text-green-600">${totals.profit.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Net earnings</p>
        </Card>
        <Card className="border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Items Sold</p>
          <p className="font-mono text-2xl font-bold text-foreground">{totals.items}</p>
          <p className="text-xs text-muted-foreground">Total units</p>
        </Card>
        <Card className="border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Average Sale</p>
          <p className="font-mono text-2xl font-bold text-foreground">
            ${totals.count > 0 ? (totals.revenue / totals.count).toFixed(2) : "0.00"}
          </p>
          <p className="text-xs text-muted-foreground">Per transaction</p>
        </Card>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-foreground">Date & Time</TableHead>
              <TableHead className="text-foreground">Product</TableHead>
              <TableHead className="text-foreground">Quantity</TableHead>
              <TableHead className="text-foreground">Amount</TableHead>
              <TableHead className="text-foreground">Payment</TableHead>
              <TableHead className="text-foreground">Employee</TableHead>
              <TableHead className="text-foreground">Prescription</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No sales found
                </TableCell>
              </TableRow>
            ) : (
              filteredSales.map((sale) => {
                const dt = formatDateTime(sale.timestamp)
                return (
                  <TableRow key={sale.id} className="border-border hover:bg-secondary/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-foreground">{dt.date}</p>
                          <p className="text-xs text-muted-foreground">{dt.time}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">{sale.productName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-foreground">
                        {sale.quantity}x
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono font-semibold text-foreground">
                      ${sale.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize border-border text-foreground">
                        {sale.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{sale.employeeName}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {sale.prescriptionNumber || "—"}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>Showing {filteredSales.length} transactions</p>
        <p>Total: ${totals.revenue.toFixed(2)}</p>
      </div>
    </div>
  )
}
