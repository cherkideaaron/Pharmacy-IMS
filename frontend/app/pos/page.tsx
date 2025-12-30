"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ProductSearch } from "@/components/pos/product-search"
import { Cart } from "@/components/pos/cart"
import { CheckoutDialog } from "@/components/pos/checkout-dialog"
import { useStore } from "@/lib/store"
import { Store, LogOut, User, Clock, History } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
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
  const addSale = useStore((state) => state.addSale)
  const logout = useStore((state) => state.logout)
  const fetchProducts = useStore((state) => state.fetchProducts)
  const fetchSales = useStore((state) => state.fetchSales)

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  // Fetch products and sales on mount
  useEffect(() => {
    fetchProducts()
    fetchSales()
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

  const handleConfirmCheckout = async (paymentMethod: "cash" | "mobile banking", prescriptionNumber?: string, notes?: string) => {
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
      <div className="flex flex-1 gap-4 overflow-hidden p-6">
        {/* Product Search */}
        <div className="flex-1 overflow-y-auto">
          <Card className="h-full border border-black/10 bg-white p-4 shadow-sm">
            <ProductSearch products={products} onAddToCart={handleAddToCart} />
          </Card>
        </div>

        {/* Cart and History */}
        <div className="flex w-[420px] flex-col gap-4">
          <Cart
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleCheckout}
          />

          <Card className="flex flex-1 flex-col overflow-hidden border border-black/10 bg-white shadow-sm">
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
      />
    </div>
  )
}
