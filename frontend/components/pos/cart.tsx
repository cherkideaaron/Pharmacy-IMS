"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"
import { Trash2, ShoppingCart } from "lucide-react"

interface CartItem {
  product: Product
  quantity: number
}

interface CartProps {
  items: CartItem[]
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
  onCheckout: () => void
}

export function Cart({ items, onUpdateQuantity, onRemoveItem, onCheckout }: CartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.product.unitPrice * item.quantity, 0)
  const total = subtotal

  return (
    <Card className="flex h-full flex-col border border-black/10 bg-white shadow-sm">
      <div className="border-b border-black/10 p-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="size-5 text-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Current Sale</h2>
          <Badge variant="secondary" className="ml-auto">
            {items.length} items
          </Badge>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4 min-h-[200px]">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-muted-foreground">
            <div>
              <ShoppingCart className="mx-auto mb-2 size-8 opacity-50" />
              <p className="text-sm">Cart is empty</p>
            </div>
          </div>
        ) : (
          items.map((item) => (
            <Card key={item.product.id} className="border border-black/10 bg-secondary p-3 shadow-sm">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground">{item.product.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.product.strength}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.product.id)}
                  className="size-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="size-7 p-0"
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onUpdateQuantity(item.product.id, Number.parseInt(e.target.value) || 1)}
                    className="h-7 w-16 bg-background text-center text-sm"
                    min="1"
                    max={item.product.stock}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="size-7 p-0"
                  >
                    +
                  </Button>
                </div>
                <span className="font-mono text-sm font-semibold text-foreground">
                  ${(item.product.unitPrice * item.quantity).toFixed(2)}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="border-t border-black/10 bg-secondary p-6">
        <div className="mb-6 space-y-3 text-base">
          <div className="flex justify-between border-t border-border pt-3 text-xl font-bold text-foreground">
            <span>Total</span>
            <span className="font-mono">${total.toFixed(2)}</span>
          </div>
        </div>
        <Button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full bg-primary text-primary-foreground"
        >
          Complete Sale
        </Button>
      </div>
    </Card>
  )
}
