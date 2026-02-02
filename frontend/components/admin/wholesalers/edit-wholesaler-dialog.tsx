"use client"

import { useState, useEffect } from "react"
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

interface EditWholesalerDialogProps {
    wholesaler: Wholesaler | null
    open: boolean
    onClose: () => void
    onSave: (id: string, updates: Partial<Wholesaler>) => void
}

export function EditWholesalerDialog({ wholesaler, open, onClose, onSave }: EditWholesalerDialogProps) {
    const [formData, setFormData] = useState<Partial<Wholesaler>>({})

    useEffect(() => {
        if (wholesaler) {
            setFormData(wholesaler)
        }
    }, [wholesaler])

    const handleSave = () => {
        if (!wholesaler) return
        onSave(wholesaler.id, {
            name: formData.name,
            contactPerson: formData.contactPerson,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            balance: Number(formData.balance),
        })
        onClose()
    }

    if (!wholesaler) return null

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Edit Wholesaler</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Update wholesaler details and balance.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name" className="text-foreground">Name</Label>
                        <Input
                            id="edit-name"
                            value={formData.name || ""}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-secondary border-border text-foreground"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-contactPerson" className="text-foreground">Contact Person</Label>
                        <Input
                            id="edit-contactPerson"
                            value={formData.contactPerson || ""}
                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                            className="bg-secondary border-border text-foreground"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-phone" className="text-foreground">Phone</Label>
                            <Input
                                id="edit-phone"
                                value={formData.phone || ""}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="bg-secondary border-border text-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-balance" className="text-foreground">Current Balance ($)</Label>
                            <Input
                                id="edit-balance"
                                type="number"
                                step="0.01"
                                value={formData.balance}
                                onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
                                className="bg-secondary border-border text-foreground"
                            />
                            <p className="text-[10px] text-muted-foreground">Positive: Debt. Negative: Credit.</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-email" className="text-foreground">Email</Label>
                        <Input
                            id="edit-email"
                            type="email"
                            value={formData.email || ""}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="bg-secondary border-border text-foreground"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-address" className="text-foreground">Address</Label>
                        <Input
                            id="edit-address"
                            value={formData.address || ""}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="bg-secondary border-border text-foreground"
                        />
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
