"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/types"
import { AlertTriangle, Package } from "lucide-react"

interface LowStockAlertProps {
  products: Product[]
  onViewInventory: () => void
}

export function LowStockAlert({ products, onViewInventory }: LowStockAlertProps) {
  const lowStockProducts = products
    .filter((p) => p.stock <= p.reorderLevel)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5)

  return (
    <Card className="border-border bg-card">
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Low Stock Alert</h2>
            <p className="text-sm text-muted-foreground">Items requiring immediate reorder</p>
          </div>
          <Button onClick={onViewInventory} size="sm" className="bg-primary text-primary-foreground">
            View All
          </Button>
        </div>
      </div>
      <div className="p-6">
        {lowStockProducts.length === 0 ? (
          <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
            <Package className="size-5 text-green-500" />
            <p className="text-sm text-muted-foreground">All items are well stocked</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-lg bg-destructive/10 p-4 border border-destructive/20"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="size-5 text-destructive" />
                  <div>
                    <h3 className="font-semibold text-foreground">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {product.strength} · {product.location}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="destructive" className="mb-1">
                    {product.stock} left
                  </Badge>
                  <p className="text-xs text-muted-foreground">Reorder at {product.reorderLevel}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
