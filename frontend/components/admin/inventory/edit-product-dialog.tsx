"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { Product } from "@/lib/types"

interface EditProductDialogProps {
  product: Product | null
  open: boolean
  onClose: () => void
  onSave: (product: Product) => void
}

export function EditProductDialog({ product, open, onClose, onSave }: EditProductDialogProps) {
  const [formData, setFormData] = useState<Partial<Product>>(() => product ?? {})

  if (!product) return null

  const handleSave = () => {
    onSave(formData as Product)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Product</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update product information and inventory details
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Product Name
              </Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genericName" className="text-foreground">
                Generic Name
              </Label>
              <Input
                id="genericName"
                value={formData.genericName || ""}
                onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                className="bg-secondary border-border text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturer" className="text-foreground">
                Manufacturer
              </Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer || ""}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground">
                Category
              </Label>
              <Select
                value={formData.category || ""}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-secondary border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                  <SelectItem value="Pain Relief">Pain Relief</SelectItem>
                  <SelectItem value="Cardiovascular">Cardiovascular</SelectItem>
                  <SelectItem value="Diabetes">Diabetes</SelectItem>
                  <SelectItem value="Respiratory">Respiratory</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="strength" className="text-foreground">
                Strength
              </Label>
              <Input
                id="strength"
                value={formData.strength || ""}
                onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dosageForm" className="text-foreground">
                Dosage Form
              </Label>
              <Select
                value={formData.dosageForm || ""}
                onValueChange={(value) => setFormData({ ...formData, dosageForm: value })}
              >
                <SelectTrigger className="bg-secondary border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tablet">Tablet</SelectItem>
                  <SelectItem value="Capsule">Capsule</SelectItem>
                  <SelectItem value="Syrup">Syrup</SelectItem>
                  <SelectItem value="Injection">Injection</SelectItem>
                  <SelectItem value="Cream">Cream</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-foreground">
                Location
              </Label>
              <Input
                id="location"
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-secondary border-border text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock" className="text-foreground">
                Current Stock
              </Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock || 0}
                onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) })}
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorderLevel" className="text-foreground">
                Reorder Level
              </Label>
              <Input
                id="reorderLevel"
                type="number"
                value={formData.reorderLevel || 0}
                onChange={(e) => setFormData({ ...formData, reorderLevel: Number.parseInt(e.target.value) })}
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPrice" className="text-foreground">
                Cost Price ($)
              </Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                value={formData.costPrice || 0}
                onChange={(e) => setFormData({ ...formData, costPrice: Number.parseFloat(e.target.value) })}
                className="bg-secondary border-border text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitPrice" className="text-foreground">
                Unit Price ($)
              </Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                value={formData.unitPrice || 0}
                onChange={(e) => setFormData({ ...formData, unitPrice: Number.parseFloat(e.target.value) })}
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-foreground">
                Location
              </Label>
              <Input
                id="location"
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate" className="text-foreground">
                Expiry Date
              </Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate?.split("T")[0] || ""}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="bg-secondary border-border text-foreground"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="requiresPrescription"
              checked={formData.requiresPrescription || false}
              onCheckedChange={(checked) => setFormData({ ...formData, requiresPrescription: !!checked })}
            />
            <Label htmlFor="requiresPrescription" className="text-sm font-normal text-foreground">
              Requires Prescription
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border bg-transparent text-foreground">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary text-primary-foreground">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
