"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Product } from "@/lib/types"
import { Package } from "lucide-react"

interface ExpiringItemsDialogProps {
  products: Product[]
  open: boolean
  onClose: () => void
}

export function ExpiringItemsDialog({ products, open, onClose }: ExpiringItemsDialogProps) {
  const twoMonthsFromNow = new Date()
  twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2)

  const expiringItems = products
    .filter((p) => new Date(p.expiryDate) <= twoMonthsFromNow && new Date(p.expiryDate) > new Date())
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  const getDaysUntilExpiry = (dateStr: string) => {
    const today = new Date()
    const expiryDate = new Date(dateStr)
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl rounded-2xl border border-black/60 bg-white/98 px-6 py-5 text-black shadow-2xl md:px-8">
        <DialogHeader className="border-b border-black/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full border border-black/20 bg-zinc-50">
              <Package className="size-5 text-zinc-700" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold tracking-tight text-black md:text-xl">
                Soon Expiring Items
              </DialogTitle>
              <p className="text-xs text-zinc-600 md:text-sm">Products expiring within the next 2 months</p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[520px] overflow-x-hidden">
          {expiringItems.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              <p className="text-sm">No items expiring in the next 2 months</p>
            </div>
          ) : (
            <div className="rounded-xl border border-black/10 bg-zinc-50/60">
              <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow className="border-b border-black/10 bg-zinc-100/80">
                    <TableHead className="w-[38%] pl-5 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Medicine
                    </TableHead>
                    <TableHead className="w-[16%] text-center text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Quantity
                    </TableHead>
                    <TableHead className="w-[22%] text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Expiry Date
                    </TableHead>
                    <TableHead className="w-[24%] text-center text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Days Remaining
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiringItems.map((product, index) => {
                    const daysLeft = getDaysUntilExpiry(product.expiryDate)

                    return (
                      <TableRow
                        key={product.id}
                        className={`border-b border-black/5 ${
                          index % 2 === 0 ? "bg-white" : "bg-zinc-50"
                        } hover:bg-zinc-100`}
                      >
                        <TableCell className="pl-5">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-zinc-900">{product.name}</p>
                            <p className="text-xs text-zinc-500">{product.strength}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-sm font-semibold text-zinc-900">
                          {product.stock}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-800">{formatDate(product.expiryDate)}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={daysLeft <= 30 ? "destructive" : "secondary"}
                            className={
                              daysLeft <= 30
                                ? "border border-red-500/50 bg-red-500/10 px-3 text-xs font-medium text-red-700"
                                : "border border-amber-500/50 bg-amber-50 px-3 text-xs font-medium text-amber-700"
                            }
                          >
                            {daysLeft} days
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </ScrollArea>

        <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4">
          <p className="text-xs text-zinc-500">
            Showing <span className="font-medium text-zinc-700">{expiringItems.length}</span> expiring items
          </p>
          <div className="flex justify-end gap-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-black/60 bg-white text-black hover:bg-zinc-100"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
