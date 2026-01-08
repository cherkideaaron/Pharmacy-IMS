"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Product } from "@/lib/types"
import { Search, Edit, AlertTriangle, Calendar, Plus, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ProductTableProps {
  products: Product[]
  onEditProduct: (product: Product) => void
  onDeleteProduct: (product: Product) => void
  onAddProduct: () => void
}

export function ProductTable({ products, onEditProduct, onDeleteProduct, onAddProduct }: ProductTableProps) {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  const categories = Array.from(new Set(products.map((p) => p.category)))

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.genericName.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase()) ||
      product.barcode.includes(search)

    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && product.stock <= product.reorderLevel) ||
      (stockFilter === "normal" && product.stock > product.reorderLevel)

    return matchesSearch && matchesCategory && matchesStock
  })

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const ninetyDaysFromNow = new Date()
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90)
    return expiry <= ninetyDaysFromNow
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products, SKU, or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary border-border text-foreground"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px] bg-secondary border-border text-foreground">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-[180px] bg-secondary border-border text-foreground">
            <SelectValue placeholder="Stock Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="normal">Normal Stock</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={onAddProduct} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 size-4" />
          Add Product
        </Button>
      </div>

      {/* Desktop Table - Hidden on Mobile */}
      <div className="hidden rounded-lg border border-border bg-card lg:block">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-foreground">Product</TableHead>
              <TableHead className="text-foreground">Category</TableHead>
              <TableHead className="text-foreground">SKU</TableHead>
              <TableHead className="text-foreground">Stock</TableHead>
              <TableHead className="text-foreground">Price</TableHead>
              <TableHead className="text-foreground">Location</TableHead>
              <TableHead className="text-foreground">Expiry</TableHead>
              <TableHead className="text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="border-border hover:bg-secondary/50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{product.name}</span>
                        {product.requiresPrescription && (
                          <Badge variant="outline" className="text-xs border-destructive text-destructive">
                            Rx
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {product.genericName} · {product.strength}
                      </p>
                      <p className="text-xs text-muted-foreground">{product.manufacturer}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{product.category}</TableCell>
                  <TableCell className="font-mono text-sm text-foreground">{product.sku}</TableCell>
                  <TableCell>
                    {product.stock <= product.reorderLevel ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="size-3" />
                        {product.stock}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-foreground">
                        {product.stock}
                      </Badge>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">Reorder: {product.reorderLevel}</p>
                  </TableCell>
                  <TableCell className="font-mono text-foreground">${product.unitPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-sm text-foreground">{product.location}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">
                        {new Date(product.expiryDate).toLocaleDateString()}
                      </span>
                      {isExpiringSoon(product.expiryDate) && (
                        <Badge variant="outline" className="text-[10px] border-destructive text-destructive px-1 h-4">
                          Expiring Soon
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Batch: {product.batchNumber}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditProduct(product)}
                        className="text-foreground hover:bg-primary hover:text-primary-foreground"
                      >
                        <Edit className="size-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setProductToDelete(product)}
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-4 lg:hidden">
        {filteredProducts.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
            No products found
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="rounded-lg border border-border bg-card p-4">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{product.name}</h3>
                    {product.requiresPrescription && (
                      <Badge variant="outline" className="text-xs border-destructive text-destructive">
                        Rx
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{product.genericName} · {product.strength}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onEditProduct(product)} className="h-8 w-8">
                    <Edit className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setProductToDelete(product)} className="h-8 w-8 text-destructive hover:text-destructive">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Stock</span>
                  <div className="flex items-center gap-2">
                    {product.stock <= product.reorderLevel ? (
                      <Badge variant="destructive" className="gap-1 px-1.5 h-5">
                        {product.stock}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="px-1.5 h-5 text-foreground">
                        {product.stock}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">(Reorder: {product.reorderLevel})</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">Price</span>
                  <p className="font-mono font-semibold">${product.unitPrice.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">SKU / Location</span>
                  <p className="truncate">{product.sku}</p>
                  <p className="text-xs text-muted-foreground">{product.location}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">Expiry</span>
                  <p className={isExpiringSoon(product.expiryDate) ? "text-destructive font-medium" : "text-foreground"}>
                    {new Date(product.expiryDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {filteredProducts.length} of {products.length} products
        </p>
        <p>{filteredProducts.filter((p) => p.stock <= p.reorderLevel).length} items need reordering</p>
      </div>

      <AlertDialog open={!!productToDelete} onOpenChange={(open: boolean) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {productToDelete?.name} from the inventory. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (productToDelete) {
                  onDeleteProduct(productToDelete)
                  setProductToDelete(null)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
