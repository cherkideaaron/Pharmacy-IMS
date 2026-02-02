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
import type { Wholesaler } from "@/lib/types"

interface AddWholesalerDialogProps {
    open: boolean
    onClose: () => void
    onSave: (wholesaler: Omit<Wholesaler, "id" | "createdAt" | "updatedAt">) => void
}

export function AddWholesalerDialog({ open, onClose, onSave }: AddWholesalerDialogProps) {
    const [formData, setFormData] = useState({
        name: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
        balance: "0",
    })

    const handleSave = () => {
        onSave({
            name: formData.name,
            contactPerson: formData.contactPerson || undefined,
            phone: formData.phone || undefined,
            email: formData.email || undefined,
            address: formData.address || undefined,
            balance: Number(formData.balance) || 0,
        })
        setFormData({
            name: "",
            contactPerson: "",
            phone: "",
            email: "",
            address: "",
            balance: "0",
        })
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Add Wholesaler</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Register a new wholesaler or supplier.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-foreground">Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-secondary border-border text-foreground"
                            placeholder="e.g. Acme Pharmaceuticals"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contactPerson" className="text-foreground">Contact Person</Label>
                        <Input
                            id="contactPerson"
                            value={formData.contactPerson}
                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                            className="bg-secondary border-border text-foreground"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-foreground">Phone</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="bg-secondary border-border text-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="balance" className="text-foreground">Initial Balance ($)</Label>
                            <Input
                                id="balance"
                                type="number"
                                step="0.01"
                                value={formData.balance}
                                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                                className="bg-secondary border-border text-foreground"
                                placeholder="Positive = Debt"
                            />
                            <p className="text-[10px] text-muted-foreground">Positive: You owe them. Negative: They owe you.</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="bg-secondary border-border text-foreground"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address" className="text-foreground">Address</Label>
                        <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="bg-secondary border-border text-foreground"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} className="border-border bg-transparent text-foreground">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!formData.name} className="bg-primary text-primary-foreground">
                        Add Wholesaler
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
