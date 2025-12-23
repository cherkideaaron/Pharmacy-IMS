"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/types"
import { Search, Plus, AlertTriangle, Calendar } from "lucide-react"

interface ProductSearchProps {
  products: Product[]
  onAddToCart: (product: Product) => void
}

export function ProductSearch({ products, onAddToCart }: ProductSearchProps) {
  const [search, setSearch] = useState("")

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.genericName.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search) ||
      p.sku.toLowerCase().includes(search.toLowerCase()),
  )

  const formatExpiryDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  const isExpiringSoon = (dateStr: string) => {
    const expiryDate = new Date(dateStr)
    const twoMonthsFromNow = new Date()
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2)
    return expiryDate <= twoMonthsFromNow && expiryDate > new Date()
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, barcode, or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-secondary border-border text-foreground"
        />
      </div>

      <div className="space-y-2 max-h-[calc(100vh-20rem)] overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-sm">No products found</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="flex items-center justify-between border border-black/10 bg-white p-4 shadow-sm transition-colors hover:border-black/30 hover:bg-zinc-50"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{product.name}</h3>
                  {product.requiresPrescription && (
                    <Badge variant="outline" className="text-xs border-destructive text-destructive">
                      Rx
                    </Badge>
                  )}
                  {product.stock <= product.reorderLevel && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="mr-1 size-3" />
                      Low Stock
                    </Badge>
                  )}
                  {isExpiringSoon(product.expiryDate) && (
                    <Badge variant="outline" className="text-xs border-orange-500 text-orange-500">
                      <Calendar className="mr-1 size-3" />
                      Expiring Soon
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {product.genericName} · {product.strength} · {product.dosageForm}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>SKU: {product.sku}</span>
                  <span>Stock: {product.stock}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    Exp: {formatExpiryDate(product.expiryDate)}
                  </span>
                  <span className="font-semibold text-foreground">${product.unitPrice.toFixed(2)}</span>
                </div>
              </div>
              <Button
                onClick={() => onAddToCart(product)}
                size="sm"
                className="ml-4 bg-primary text-primary-foreground"
                disabled={product.stock === 0}
              >
                <Plus className="mr-1 size-4" />
                Add
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
