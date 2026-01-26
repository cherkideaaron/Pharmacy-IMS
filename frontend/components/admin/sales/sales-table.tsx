"use client"

import { useState, useEffect, useMemo } from "react" // Added useEffect
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Sale, Product } from "@/lib/types"
import { Search, Download, Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"
import { startOfMonth, endOfMonth, format } from "date-fns"
import { useStore } from "@/lib/store"

interface SalesTableProps {
  sales: Sale[]
  products: Product[]
}

export function SalesTable({ sales, products = [] }: SalesTableProps) {
  const getSalesByDateRange = useStore((state) => state.getSalesByDateRange)
  const [viewSales, setViewSales] = useState<Sale[]>(sales)
  const [search, setSearch] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)

  // Update viewSales when props.sales changes (only if not filtering by specific month/year)
  useEffect(() => {
    if (selectedYear === "all" || selectedMonth === "all") {
      setViewSales(sales)
    }
  }, [sales, selectedYear, selectedMonth])

  // Handle Month/Year filter changes
  useEffect(() => {
    const fetchFilteredSales = async () => {
      if (selectedYear !== "all" && selectedMonth !== "all") {
        setIsLoading(true)
        try {
          const year = parseInt(selectedYear)
          const month = parseInt(selectedMonth)
          const startDate = startOfMonth(new Date(year, month)).toISOString()
          const endDate = endOfMonth(new Date(year, month)).toISOString()

          const filteredData = await getSalesByDateRange(startDate, endDate)
          setViewSales(filteredData)
          // Reset quick date filter when using specific month/year
          setDateFilter("all")
        } catch (error) {
          console.error("Failed to fetch filtered sales", error)
        } finally {
          setIsLoading(false)
        }
      } else if (selectedYear === "all" || selectedMonth === "all") {
        // Revert to default props sales if filters are cleared
        setViewSales(sales)
      }
    }

    fetchFilteredSales()
  }, [selectedYear, selectedMonth, getSalesByDateRange, sales])

  // Generate Year Options (Current Year back to 2023)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 2023 + 1 }, (_, i) => (2023 + i).toString())

  // Month Options
  const months = [
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
  ]

  const filteredSales = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(today)
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    return viewSales
      .filter((sale) => {
        const matchesSearch =
          sale.productName.toLowerCase().includes(search.toLowerCase()) ||
          sale.employeeName.toLowerCase().includes(search.toLowerCase()) ||
          sale.customerName?.toLowerCase().includes(search.toLowerCase()) ||
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
  }, [viewSales, search, paymentFilter, dateFilter])

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
          profit: acc.profit + profit,
          cashSales: acc.cashSales + (sale.paymentMethod === "cash" ? sale.quantity : 0),
          mobileSales: acc.mobileSales + (sale.paymentMethod === "mobile banking" ? sale.quantity : 0),
          cashRevenue: acc.cashRevenue + (sale.paymentMethod === "cash" ? sale.totalAmount : 0),
          mobileRevenue: acc.mobileRevenue + (sale.paymentMethod === "mobile banking" ? sale.totalAmount : 0)
        }
      },
      { revenue: 0, count: 0, items: 0, profit: 0, cashSales: 0, mobileSales: 0, cashRevenue: 0, mobileRevenue: 0 },
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
    const headers = ["Date", "Time", "Product", "Quantity", "Total Amount", "Payment Method", "Employee", "Customer", "Prescription"]

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
        sale.customerName ? `"${sale.customerName.replace(/"/g, '""')}"` : "Walk-in",
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
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by product, employee, customer, or prescription..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-border text-foreground"
          />
        </div>


        {/* Month/Year Filters */}
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[130px] bg-secondary border-border text-foreground">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Month</SelectItem>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px] bg-secondary border-border text-foreground">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Year</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Select
          value={dateFilter}
          onValueChange={(val) => {
            setDateFilter(val)
            if (val !== "all") {
              setSelectedMonth("all")
              setSelectedYear("all")
            }
          }}
          disabled={selectedYear !== "all" && selectedMonth !== "all"}
        >
          <SelectTrigger className="w-[150px] bg-secondary border-border text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Recent</SelectItem>
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
            <SelectItem value="mobile banking">Mobile Banking</SelectItem>
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
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
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
        <Card className="border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Cash Sales</p>
          <p className="font-mono text-2xl font-bold text-foreground">${totals.cashRevenue.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{totals.cashSales} items sold</p>
        </Card>
        <Card className="border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Mobile Banking Sales</p>
          <p className="font-mono text-2xl font-bold text-foreground">${totals.mobileRevenue.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{totals.mobileSales} items sold</p>
        </Card>
      </div>

      {/* Desktop Table - Hidden on Mobile */}
      <div className="hidden rounded-lg border border-border bg-card lg:block">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-foreground">Date & Time</TableHead>
              <TableHead className="text-foreground">Product</TableHead>
              <TableHead className="text-foreground">Quantity</TableHead>
              <TableHead className="text-foreground">Amount</TableHead>
              <TableHead className="text-foreground">Payment</TableHead>
              <TableHead className="text-foreground">Employee</TableHead>
              <TableHead className="text-foreground">Customer</TableHead>
              <TableHead className="text-foreground">Prescription</TableHead>
              <TableHead className="text-foreground">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
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
                    <TableCell className="text-sm text-foreground">
                      {sale.customerName || <span className="text-muted-foreground italic">Walk-in</span>}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {sale.prescriptionNumber || "—"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground italic" title={sale.notes}>
                      {sale.notes || "—"}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 md:grid-cols-2 lg:hidden">
        {filteredSales.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
            No sales found
          </div>
        ) : (
          filteredSales.map((sale) => {
            const dt = formatDateTime(sale.timestamp)
            return (
              <Card key={sale.id} className="border-border bg-card p-4">
                <div className="mb-4 flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{sale.productName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="size-3" />
                      {dt.date} at {dt.time}
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize border-border text-foreground">{sale.paymentMethod}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Quantity</p>
                    <p className="font-medium text-foreground">{sale.quantity}x</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                    <p className="font-mono font-bold text-foreground">${sale.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Employee</p>
                    <p className="text-foreground">{sale.employeeName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Customer</p>
                    <p className="text-foreground">{sale.customerName || "Walk-in"}</p>
                  </div>
                </div>

                {(sale.prescriptionNumber || sale.notes) && (
                  <div className="mt-4 border-t border-border pt-3 text-xs">
                    {sale.prescriptionNumber && (
                      <p className="text-muted-foreground"><span className="font-medium text-foreground">Rx:</span> {sale.prescriptionNumber}</p>
                    )}
                    {sale.notes && (
                      <p className="text-muted-foreground mt-1"><span className="font-medium text-foreground">Note:</span> {sale.notes}</p>
                    )}
                  </div>
                )}
              </Card>
            )
          })
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          {isLoading ? "Loading data..." : `Showing ${filteredSales.length} transactions`}
        </p>
        <p>Total: ${totals.revenue.toFixed(2)}</p>
      </div>
    </div >
  )
}
