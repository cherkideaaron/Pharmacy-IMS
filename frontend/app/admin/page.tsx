"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/admin/sidebar"
import { StatCard } from "@/components/admin/stat-card"
import { RecentSales } from "@/components/admin/recent-sales"
import { LowStockAlert } from "@/components/admin/low-stock-alert"
import { ProductTable } from "@/components/admin/inventory/product-table"
import { EditProductDialog } from "@/components/admin/inventory/edit-product-dialog"
import { SalesTable } from "@/components/admin/sales/sales-table"
import { AuditTable } from "@/components/admin/audit/audit-table"
import { AddProductDialog } from "@/components/admin/inventory/add-product-dialog"
import { ExpiringItemsDialog } from "@/components/admin/expiring-items-dialog"
import { useStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"
import { DollarSign, TrendingUp, ShoppingCart, Calendar } from "lucide-react"

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
  }, [fetchProducts, fetchSales, fetchAuditLogs])

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

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} userName={currentUser.name} />

      <main className="flex-1 overflow-y-auto">
        {activeTab === "overview" && (
          <div className="p-8 space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
              <p className="text-muted-foreground">Real-time pharmacy operations metrics</p>
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
              <LowStockAlert products={products} onViewInventory={() => setActiveTab("inventory")} />
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
