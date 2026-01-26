"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"

interface ProductDetailsDialogProps {
    product: Product | null
    open: boolean
    onClose: () => void
    onAddToCart: (product: Product) => void
}

export function ProductDetailsDialog({ product, open, onClose, onAddToCart }: ProductDetailsDialogProps) {
    if (!product) return null

    const handleAddToCart = () => {
        onAddToCart(product)
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-md bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                        {product.name}
                        {product.requiresPrescription && (
                            <Badge variant="outline" className="border-destructive text-destructive text-xs">
                                Rx
                            </Badge>
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {product.genericName} · {product.strength}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="px-2 py-1 text-sm">
                            {product.category}
                        </Badge>
                        <span className="font-mono text-xl font-bold text-primary">
                            ${product.unitPrice.toFixed(2)}
                        </span>
                    </div>

                    <div className="border-t border-border" />

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">Details</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-muted-foreground">Dosage Form:</span>
                                <p className="font-medium text-foreground">{product.dosageForm}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Manufacturer:</span>
                                <p className="font-medium text-foreground">{product.manufacturer}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Country:</span>
                                <p className="font-medium text-foreground">{product.countryOrigin || "N/A"}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Stock:</span>
                                <p className={`font-medium ${product.stock <= product.reorderLevel ? 'text-destructive' : 'text-foreground'}`}>
                                    {product.stock}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border" />

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">Description / Information</h4>
                        <div className="rounded-md bg-secondary/50 p-3 text-sm text-foreground space-y-2 max-h-[150px] overflow-y-auto">
                            <p>{product.description || "No description available."}</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                        Close
                    </Button>
                    <Button
                        onClick={handleAddToCart}
                        className="w-full sm:w-auto bg-primary text-primary-foreground"
                        disabled={product.stock === 0}
                    >
                        Add to Cart
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
