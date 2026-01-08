"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/admin/sidebar"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/admin/stat-card"
import { RecentSales } from "@/components/admin/recent-sales"
import { LowStockAlert } from "@/components/admin/low-stock-alert"
import { ProductTable } from "@/components/admin/inventory/product-table"
import { EditProductDialog } from "@/components/admin/inventory/edit-product-dialog"
import { SalesTable } from "@/components/admin/sales/sales-table"
import { AuditTable } from "@/components/admin/audit/audit-table"
import { AddProductDialog } from "@/components/admin/inventory/add-product-dialog"
import { ExpiringItemsDialog } from "@/components/admin/expiring-items-dialog"
import { AdminSettlementHistory } from "@/components/admin/settlement-history"
import { useStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"
import { DollarSign, TrendingUp, ShoppingCart, Calendar, Landmark, AlertCircle, Banknote, ArrowRight, CheckCircle2, Plus, History, Menu, LayoutDashboard } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function AdminPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Store selectors
  const currentUser = useStore((state) => state.currentUser)
  const products = useStore((state) => state.products)
  const sales = useStore((state) => state.sales)
  const auditLogs = useStore((state) => state.auditLogs)
  const updateProduct = useStore((state) => state.updateProduct)
  const addProduct = useStore((state) => state.addProduct)
  const logout = useStore((state) => state.logout)
  const fetchProducts = useStore((state) => state.fetchProducts)
  const fetchSales = useStore((state) => state.fetchSales)
  const fetchAuditLogs = useStore((state) => state.fetchAuditLogs)

  const deleteProduct = useStore((state) => state.deleteProduct)
  const fetchDeposits = useStore((state) => state.fetchDeposits)
  const deposits = useStore((state) => state.deposits)

  const [activeTab, setActiveTab] = useState("overview")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [expiringDialogOpen, setExpiringDialogOpen] = useState(false)

  // Initial data fetch
  useEffect(() => {
    fetchProducts()
    fetchSales()
    fetchAuditLogs()
    fetchDeposits()
  }, [fetchProducts, fetchSales, fetchAuditLogs, fetchDeposits])

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      router.push("/")
    }
  }, [currentUser, router])

  const stats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todaySales = sales.filter((s) => new Date(s.timestamp) >= today)
    const totalRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0)

    const totalProfit = todaySales.reduce((sum, sale) => {
      const product = products.find((p) => p.id === sale.productId)
      if (product) {
        const profitPerUnit = sale.unitPrice - product.costPrice
        return sum + profitPerUnit * sale.quantity
      }
      return sum
    }, 0)

    const lowStockCount = products.filter((p) => p.stock <= p.reorderLevel).length

    const twoMonthsFromNow = new Date()
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2)
    const expiringCount = products.filter(
      (p) => new Date(p.expiryDate) <= twoMonthsFromNow && new Date(p.expiryDate) > new Date(),
    ).length

    return {
      todayRevenue: totalRevenue,
      todayProfit: totalProfit,
      todaySales: todaySales.length,
      lowStockCount,
      expiringCount,
    }
  }, [sales, products])

  const depositStats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    const todayDeposits = deposits.filter(d => d.date === todayStr)

    // Total cash revenue recorded in sales today
    const totalCashSales = sales
      .filter(s => s.timestamp.startsWith(todayStr) && s.paymentMethod === "cash")
      .reduce((sum, s) => sum + s.totalAmount, 0)

    const totalDebtPayments = auditLogs
      .filter(log =>
        log.timestamp.startsWith(todayStr) &&
        log.action === "debt_updated" &&
        ((log.metadata as any)?.paymentAmount || 0) > 0
      )
      .reduce((sum, log) => sum + ((log.metadata as any)?.paymentAmount || 0), 0)

    const totalExpectedToday = totalCashSales + totalDebtPayments
    const totalSubmitted = todayDeposits.reduce((sum, d) => sum + d.amountSubmitted, 0)
    const discrepancy = totalSubmitted - totalExpectedToday

    return {
      totalCashRevenue: totalExpectedToday,
      totalSubmitted,
      discrepancy,
      hasDeposits: todayDeposits.length > 0,

      // Lifetime System Balance
      systemExpectedSales: sales
        .filter((s) => s.paymentMethod === "cash")
        .reduce((sum, s) => sum + s.totalAmount, 0),
      systemExpectedDebt: auditLogs
        .filter(log =>
          log.action === "debt_updated" &&
          ((log.metadata as any)?.paymentAmount || 0) > 0
        )
        .reduce((sum, log) => sum + ((log.metadata as any)?.paymentAmount || 0), 0),
      systemSubmitted: deposits.reduce((sum, d) => sum + d.amountSubmitted, 0),
    }
  }, [deposits, sales, auditLogs])

  const systemExpectedTotal = (depositStats.systemExpectedSales || 0) + (depositStats.systemExpectedDebt || 0)
  const systemBalance = depositStats.systemSubmitted - systemExpectedTotal


  if (!currentUser || currentUser.role !== "admin") {
    // Show loading state or null while redirecting
    return null
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setEditDialogOpen(true)
  }

  const handleSaveProduct = async (product: Product) => {
    try {
      await updateProduct(product.id, product)
      toast({
        title: "Product updated",
        description: `${product.name} has been updated successfully`,
      })
      setEditDialogOpen(false)
      setEditingProduct(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      })
    }
  }

  const handleAddProduct = async (product: Product) => {
    try {
      await addProduct(product)
      toast({
        title: "Product added",
        description: `${product.name} has been added to inventory`,
      })
      setAddDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = async (product: Product) => {
    try {
      await deleteProduct(product.id)
      toast({
        title: "Product deleted",
        description: `${product.name} has been removed from inventory`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="size-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-r w-64">
              <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onLogout={handleLogout}
                userName={currentUser.name}
                className="w-full border-none"
                onNavigate={() => setSheetOpen(false)}
              />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="size-5 text-primary" />
            <span className="font-mono font-bold">Jack-VET</span>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} userName={currentUser.name} />
      </div>

      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        {activeTab === "overview" && (
          <div className="p-8 space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Overview</h2>
              <p className="text-muted-foreground">Real-time veterinary operations metrics</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Today's Revenue"
                value={`$${stats.todayRevenue.toFixed(2)}`}
                icon={DollarSign}
                trend="up"
                trendValue="12.5%"
              />
              <StatCard
                title="Sales Today"
                value={stats.todaySales}
                subtitle={`${stats.todaySales} transactions`}
                icon={ShoppingCart}
                trend="up"
                trendValue="8.2%"
              />
              <StatCard
                title="Today's Profit"
                value={`$${stats.todayProfit.toFixed(2)}`}
                subtitle="Net profit from sales"
                icon={TrendingUp}
                trend="up"
                trendValue="15.3%"
              />
              <StatCard
                title="System Balance"
                value={`${systemBalance >= 0 ? '+' : ''}$${systemBalance.toFixed(2)}`}
                subtitle="Overall cash vs deposits"
                icon={Landmark}
                trend={systemBalance < 0 ? "down" : "up"}
                trendValue={systemBalance < 0 ? "Shortage" : "Excess"}
                className={systemBalance < 0 ? "border-red-200 bg-red-50/10" : "border-green-200 bg-green-50/10"}
              />
              <StatCard
                title="Soon Expiring"
                value={stats.expiringCount}
                subtitle="Items expiring in 2 months"
                icon={Calendar}
                trend="neutral"
                trendValue="View Details"
                onClick={() => setExpiringDialogOpen(true)}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <RecentSales sales={sales} />
              <div className="space-y-6">
                <LowStockAlert products={products} onViewInventory={() => setActiveTab("inventory")} />

                <Card className="p-6 border-black/10 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <Landmark className="size-5" />
                      </div>
                      <h3 className="text-lg font-bold">Today's Settlements</h3>
                    </div>
                    {depositStats.discrepancy < 0 && (
                      <Badge variant="destructive" className="animate-pulse">
                        <AlertCircle className="mr-1 size-3" />
                        Discrepancy Found
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase">Expected Cash</p>
                      <p className="text-xl font-black font-mono tracking-tight">${depositStats.totalCashRevenue.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase">Bank Submitted</p>
                      <p className="text-xl font-black font-mono tracking-tight text-primary">${depositStats.totalSubmitted.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className={`mt-6 rounded-lg p-4 border ${depositStats.discrepancy < 0 ? 'bg-red-50 border-red-200' : 'bg-zinc-50 border-zinc-100'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Net Difference:</span>
                      <span className={`text-lg font-black font-mono ${depositStats.discrepancy < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {depositStats.discrepancy >= 0 ? '+' : ''}${depositStats.discrepancy.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Card>

                <AdminSettlementHistory sales={sales} deposits={deposits} auditLogs={auditLogs} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="p-8 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
              <p className="text-muted-foreground">Comprehensive product catalog and stock control</p>
            </div>

            <ProductTable
              products={products}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onAddProduct={() => setAddDialogOpen(true)}
            />
          </div>
        )}

        {activeTab === "sales" && (
          <div className="p-8 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Sales History</h1>
              <p className="text-muted-foreground">Complete transaction records and revenue analysis</p>
            </div>
            <SalesTable sales={sales} products={products} />
          </div>
        )}

        {activeTab === "audit" && (
          <div className="p-8 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
              <p className="text-muted-foreground">Complete system activity and security trail</p>
            </div>
            <AuditTable logs={auditLogs} />
          </div>
        )}
      </main>

      <EditProductDialog
        key={editingProduct?.id ?? "new"}
        product={editingProduct}
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false)
          setEditingProduct(null)
        }}
        onSave={handleSaveProduct}
      />

      <AddProductDialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} onSave={handleAddProduct} />

      <ExpiringItemsDialog products={products} open={expiringDialogOpen} onClose={() => setExpiringDialogOpen(false)} />
    </div>
  )
}
