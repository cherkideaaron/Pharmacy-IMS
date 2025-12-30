"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/types"
import { Search, Plus, AlertTriangle, Calendar } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
    <div className="flex h-full flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search medicines by name, generic name, or barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white border-black/10 text-foreground"
        />
      </div>

      <div className="flex-1 overflow-hidden rounded-md border border-black/5 bg-zinc-50/30">
        <div className="h-full overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center text-muted-foreground">
              <Search className="size-12 mb-4 opacity-10" />
              <p className="text-sm">No products found holding that description</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-white sticky top-0 z-10 shadow-sm">
                <TableRow className="border-black/5 hover:bg-transparent">
                  <TableHead className="text-foreground font-bold">Medicine Name</TableHead>
                  <TableHead className="text-foreground font-bold">Generic / Strength</TableHead>
                  <TableHead className="text-foreground font-bold">Category</TableHead>
                  <TableHead className="text-foreground font-bold text-center">Stock</TableHead>
                  <TableHead className="text-foreground font-bold text-right">Price</TableHead>
                  <TableHead className="text-foreground font-bold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="border-black/5 hover:bg-white group">
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{product.name}</span>
                          {product.requiresPrescription && (
                            <Badge variant="outline" className="text-[10px] py-0 h-4 border-destructive text-destructive font-black">
                              Rx
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-tight">
                          SKU: {product.sku}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-foreground/80">{product.genericName}</span>
                        <span className="text-xs text-muted-foreground">{product.strength} · {product.dosageForm}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="secondary" className="bg-zinc-200/50 text-zinc-700 hover:bg-zinc-200">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`font-mono font-bold ${product.stock <= product.reorderLevel ? 'text-destructive' : 'text-foreground'}`}>
                          {product.stock}
                        </span>
                        {product.stock <= product.reorderLevel && (
                          <Badge variant="destructive" className="text-[9px] py-0 px-1 leading-none uppercase">
                            Low
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <span className="font-mono font-bold text-primary">
                        ${product.unitPrice.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <Button
                        onClick={() => onAddToCart(product)}
                        size="sm"
                        className="bg-primary text-primary-foreground shadow-sm hover:scale-105 transition-transform"
                        disabled={product.stock === 0}
                      >
                        <Plus className="mr-1 size-4" />
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  )
}
