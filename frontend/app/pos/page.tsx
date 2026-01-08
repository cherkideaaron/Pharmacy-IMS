"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ProductSearch } from "@/components/pos/product-search"
import { Cart } from "@/components/pos/cart"
import { CheckoutDialog } from "@/components/pos/checkout-dialog"
import { useStore } from "@/lib/store"
import { Store, LogOut, User, Users, Clock, History, Landmark } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CustomerManagement } from "@/components/pos/customer-management"
import { DailySettlement } from "@/components/pos/daily-settlement"
import { AdminSettlementHistory } from "@/components/admin/settlement-history"
import type { Product, Sale } from "@/lib/types"

interface CartItem {
  product: Product
  quantity: number
}

export default function POSPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Store selectors
  const currentUser = useStore((state) => state.currentUser)
  const products = useStore((state) => state.products)
  const sales = useStore((state) => state.sales)
  const deposits = useStore((state) => state.deposits) // Added deposits selector
  const customers = useStore((state) => state.customers)
  const addSale = useStore((state) => state.addSale)
  const logout = useStore((state) => state.logout)
  const fetchProducts = useStore((state) => state.fetchProducts)
  const fetchSales = useStore((state) => state.fetchSales)

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("sales")

  // Fetch products and sales on mount
  useEffect(() => {
    fetchProducts()
    fetchSales()
    useStore.getState().fetchCustomers()
    useStore.getState().fetchDeposits()
  }, [fetchProducts, fetchSales])

  useEffect(() => {
    if (!currentUser) {
      router.push("/")
    }
  }, [currentUser, router])

  if (!currentUser) return null

  const handleAddToCart = (product: Product) => {
    const existingItem = cartItems.find((item) => item.product.id === product.id)
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCartItems(
          cartItems.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
        )
      } else {
        toast({
          title: "Stock limit reached",
          description: `Only ${product.stock} units available`,
          variant: "destructive",
        })
      }
    } else {
      setCartItems([...cartItems, { product, quantity: 1 }])
    }
  }

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return
    const item = cartItems.find((i) => i.product.id === productId)
    if (item && quantity > item.product.stock) {
      toast({
        title: "Stock limit reached",
        description: `Only ${item.product.stock} units available`,
        variant: "destructive",
      })
      return
    }
    setCartItems(cartItems.map((item) => (item.product.id === productId ? { ...item, quantity } : item)))
  }

  const handleRemoveItem = (productId: string) => {
    setCartItems(cartItems.filter((item) => item.product.id !== productId))
  }

  const handleCheckout = () => {
    setCheckoutOpen(true)
  }

  const handleConfirmCheckout = async (paymentMethod: "cash" | "card" | "mobile banking", prescriptionNumber?: string, notes?: string, customerId?: string, customerName?: string) => {
    const requiresPrescription = cartItems.some((item) => item.product.requiresPrescription)

    if (requiresPrescription && !prescriptionNumber) {
      toast({
        title: "Prescription required",
        description: "Please provide a prescription number",
        variant: "destructive",
      })
      return
    }

    try {
      // Process each cart item as a sale
      // Note: In a real app we might want to batch this or use a transaction
      // For now, we loop through items. 
      // Ideally, the backend/store would handle a batch sale to ensure atomicity.

      // Process each cart item as a sale sequentially to avoid race conditions on stock updates
      for (const item of cartItems) {
        const sale: any = {
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.unitPrice,
          totalAmount: item.product.unitPrice * item.quantity,
          employeeId: currentUser.id,
          employeeName: currentUser.name,
          paymentMethod,
          prescriptionNumber,
          notes,
          customerId,
          customerName,
        }
        await addSale(sale)
      }



      toast({
        title: "Sale completed",
        description: `Successfully processed ${cartItems.length} item(s)`,
      })

      setCartItems([])
      setCheckoutOpen(false)
    } catch (error) {
      toast({
        title: "Transaction failed",
        description: "There was an error processing the sale",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.unitPrice * item.quantity, 0)
  const total = subtotal * 1.1 // Including 10% tax
  const requiresPrescription = cartItems.some((item) => item.product.requiresPrescription)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dailySales = sales
    .filter((s) => s.employeeId === currentUser.id && new Date(s.timestamp) >= today)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-black/10 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Store className="size-6 text-primary" />
              <h1 className="font-mono text-xl font-bold text-foreground">Jack-VET POS</h1>
            </div>
            <p className="text-sm text-muted-foreground">Point of Sale Terminal</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="size-4 text-muted-foreground" />
              <span className="text-foreground">{currentUser.name}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-border text-foreground bg-transparent"
            >
              <LogOut className="mr-2 size-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 flex-col gap-4 p-4 overflow-y-auto md:overflow-hidden md:flex-row md:p-6">
        {/* Left Column: Sales or Customers */}
        <div className="flex flex-col gap-4 flex-none md:flex-1 md:overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="flex w-full overflow-x-auto mb-2 md:grid md:grid-cols-3 md:w-[600px] shrink-0">
              <TabsTrigger value="sales" className="flex items-center gap-2 text-xs md:text-sm">
                <Store className="size-3 md:size-4" />
                <span className="hidden sm:inline">Sales Terminal</span>
                <span className="sm:hidden">Sales</span>
              </TabsTrigger>
              <TabsTrigger value="customers" className="flex items-center gap-2 text-xs md:text-sm">
                <Users className="size-3 md:size-4" />
                <span className="hidden sm:inline">Customer Debts</span>
                <span className="sm:hidden">Debts</span>
              </TabsTrigger>
              <TabsTrigger value="settlement" className="flex items-center gap-2 text-xs md:text-sm">
                <Landmark className="size-3 md:size-4" />
                <span className="hidden sm:inline">Daily Settlement</span>
                <span className="sm:hidden">Settle</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sales" className="flex-1 overflow-hidden flex flex-col gap-4 focus-visible:outline-none">
              <div className="flex-1 overflow-y-auto">
                <Card className="min-h-[400px] border border-black/10 bg-white p-4 shadow-sm">
                  <ProductSearch products={products} onAddToCart={handleAddToCart} />
                </Card>
              </div>

              {/* Daily History - Hidden on really small screens if needed, or kept */}
              <div className="hidden h-[300px] md:block">
                <Card className="flex h-full flex-col overflow-hidden border border-black/10 bg-white shadow-sm">
                  <div className="border-b border-black/10 p-4">
                    <div className="flex items-center gap-2">
                      <History className="size-5 text-foreground" />
                      <h2 className="text-lg font-semibold text-foreground">Daily History</h2>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {dailySales.length === 0 ? (
                      <div className="flex h-32 items-center justify-center text-center text-muted-foreground">
                        <p className="text-sm">No sales today</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-black/5 hover:bg-transparent">
                            <TableHead className="text-foreground">Time</TableHead>
                            <TableHead className="text-foreground">Product</TableHead>
                            <TableHead className="text-foreground text-center">Qty</TableHead>
                            <TableHead className="text-foreground text-right">Amount</TableHead>
                            <TableHead className="text-foreground">Payment</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dailySales.map((sale) => (
                            <TableRow key={sale.id} className="border-black/5 hover:bg-secondary/50">
                              <TableCell className="py-3">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Clock className="size-3" />
                                  <span className="text-xs">{formatTime(sale.timestamp)}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-3">
                                <p className="text-sm font-semibold text-foreground">{sale.productName}</p>
                              </TableCell>
                              <TableCell className="py-3 text-center">
                                <Badge variant="secondary" className="text-xs">
                                  {sale.quantity}x
                                </Badge>
                              </TableCell>
                              <TableCell className="py-3 text-right">
                                <p className="font-mono text-sm font-semibold text-foreground">
                                  ${sale.totalAmount.toFixed(2)}
                                </p>
                              </TableCell>
                              <TableCell className="py-3">
                                <Badge variant="outline" className="capitalize text-[10px] border-black/10">
                                  {sale.paymentMethod}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="customers" className="flex-1 overflow-hidden focus-visible:outline-none">
              <CustomerManagement />
            </TabsContent>

            <TabsContent value="settlement" className="flex-1 overflow-hidden focus-visible:outline-none">
              <DailySettlement />
            </TabsContent>
          </Tabs>
        </div>


        {/* Cart and History */}
        <div className="flex w-full flex-col gap-4 md:w-[420px]">
          <Cart
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleCheckout}
          />

          <Card className="flex flex-1 flex-col overflow-hidden border border-black/10 bg-white shadow-sm md:hidden">
            {/* Mobile Daily History List */}
            <div className="border-b border-black/10 p-4">
              <div className="flex items-center gap-2">
                <History className="size-5 text-foreground" />
                <h2 className="text-lg font-semibold text-foreground">Daily History</h2>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 max-h-[300px]">
              {dailySales.length === 0 ? (
                <div className="flex h-20 items-center justify-center text-center text-muted-foreground">
                  <p className="text-sm">No sales today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dailySales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{sale.productName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          <span>{formatTime(sale.timestamp)}</span>
                          <span>·</span>
                          <span>{sale.quantity}x</span>
                        </div>
                      </div>
                      <p className="font-mono text-sm font-semibold text-foreground">${sale.totalAmount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="hidden flex-1 flex-col overflow-hidden border border-black/10 bg-white shadow-sm md:flex">
            <div className="border-b border-black/10 p-4">
              <div className="flex items-center gap-2">
                <History className="size-5 text-foreground" />
                <h2 className="text-lg font-semibold text-foreground">Daily History</h2>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {dailySales.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-center text-muted-foreground">
                  <p className="text-sm">No sales today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dailySales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{sale.productName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          <span>{formatTime(sale.timestamp)}</span>
                          <span>·</span>
                          <span>{sale.quantity}x</span>
                        </div>
                      </div>
                      <p className="font-mono text-sm font-semibold text-foreground">${sale.totalAmount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Checkout Dialog */}
      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onConfirm={handleConfirmCheckout}
        total={total}
        requiresPrescription={requiresPrescription}
        customers={customers}
      />
    </div>
  )
}
