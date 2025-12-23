"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ProductSearch } from "@/components/pos/product-search"
import { Cart } from "@/components/pos/cart"
import { CheckoutDialog } from "@/components/pos/checkout-dialog"
import { useStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import type { Product, Sale } from "@/lib/types"
import { LogOut, User } from "lucide-react"

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
  const addSale = useStore((state) => state.addSale)
  const logout = useStore((state) => state.logout)
  const fetchProducts = useStore((state) => state.fetchProducts)

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  // Fetch products on mount
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

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

  const handleConfirmCheckout = async (paymentMethod: "cash" | "card" | "insurance", prescriptionNumber?: string) => {
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

      const salesPromises = cartItems.map(async (item) => {
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
        }
        return addSale(sale)
      })

      await Promise.all(salesPromises)

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

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-black/10 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-mono text-xl font-bold text-foreground">PharmaSys POS</h1>
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

        {/* Cart */}
        <div className="w-[420px]">
          <Cart
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleCheckout}
          />
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
