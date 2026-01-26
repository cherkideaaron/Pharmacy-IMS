"use client"

import { useState, useMemo } from "react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Customer } from "@/lib/types"

interface CheckoutDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (paymentMethod: "cash" | "card" | "mobile banking", prescriptionNumber?: string, notes?: string, customerId?: string, customerName?: string) => void
  total: number
  requiresPrescription: boolean
  customers: Customer[]
}

export function CheckoutDialog({ open, onClose, onConfirm, total, requiresPrescription, customers }: CheckoutDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "mobile banking">("cash")
  const [prescriptionNumber, setPrescriptionNumber] = useState("")
  const [notes, setNotes] = useState("")
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")

  const handleConfirm = () => {
    const selectedCustomer = customers.find(c => c.id === selectedCustomerId)
    onConfirm(
      paymentMethod,
      prescriptionNumber || undefined,
      notes || undefined,
      selectedCustomerId || undefined,
      selectedCustomer?.name
    )
    setNotes("") // Clear for next sale
    setSelectedCustomerId("") // Clear customer selection
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border border-black/20 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Complete Sale</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Total amount: <span className="font-mono font-bold text-foreground">${total.toFixed(2)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-foreground">Payment Method</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as "cash" | "card" | "mobile banking")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="font-normal text-foreground">
                  Cash
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mobile banking" id="mobile-banking" />
                <Label htmlFor="mobile-banking" className="font-normal text-foreground">
                  Mobile Banking
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">
              Sale Notes (Optional)
            </Label>
            <Input
              id="notes"
              placeholder="Enter message or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-secondary border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer" className="text-foreground">
              Customer (Optional)
            </Label>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue placeholder="Walk-in customer (no account)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Walk-in customer (no account)</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} {customer.phone && `(${customer.phone})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {requiresPrescription && (
            <div className="space-y-2">
              <Label htmlFor="prescription" className="text-foreground">
                Prescription Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="prescription"
                placeholder="RX-2024-001"
                value={prescriptionNumber}
                onChange={(e) => setPrescriptionNumber(e.target.value)}
                className="bg-secondary border-border text-foreground"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border bg-transparent">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={requiresPrescription && !prescriptionNumber}
            className="bg-primary text-primary-foreground"
          >
            Confirm Sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
