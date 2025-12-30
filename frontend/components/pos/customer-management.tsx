"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"
import { Search, Plus, Users, CreditCard, Phone, UserPlus } from "lucide-react"
import type { Customer } from "@/lib/types"

export function CustomerManagement() {
    const customers = useStore((state) => state.customers)
    const addCustomer = useStore((state) => state.addCustomer)
    const updateCustomerDebt = useStore((state) => state.updateCustomerDebt)

    const [searchTerm, setSearchTerm] = useState("")
    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [debtDialogOpen, setDebtDialogOpen] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

    // New Customer Form State
    const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", debtAmount: 0 })

    // Debt Update Form State
    const [paymentAmount, setPaymentAmount] = useState<string>("")
    const [additionalDebt, setAdditionalDebt] = useState<string>("")

    const filteredCustomers = useMemo(() => {
        return customers.filter(
            (c) =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.phone.includes(searchTerm)
        )
    }, [customers, searchTerm])

    const handleAddCustomer = async () => {
        if (!newCustomer.name) return
        await addCustomer({
            name: newCustomer.name,
            phone: newCustomer.phone,
            debtAmount: Number(newCustomer.debtAmount) || 0
        })
        setNewCustomer({ name: "", phone: "", debtAmount: 0 })
        setAddDialogOpen(false)
    }

    const handleUpdateDebt = async () => {
        if (!selectedCustomer) return

        const payment = Number(paymentAmount) || 0
        const extra = Number(additionalDebt) || 0
        const newDebt = selectedCustomer.debtAmount - payment + extra

        await updateCustomerDebt(selectedCustomer.id, newDebt, payment)

        setPaymentAmount("")
        setAdditionalDebt("")
        setSelectedCustomer(null)
        setDebtDialogOpen(false)
    }

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search customers by name or phone..."
                        className="pl-9 bg-white border-black/10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary text-primary-foreground">
                            <UserPlus className="mr-2 size-4" />
                            Add Customer
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-black/20 shadow-lg">
                        <DialogHeader>
                            <DialogTitle>Add New Customer</DialogTitle>
                            <DialogDescription>
                                Create a new customer profile for debt tracking.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="cust-name">Full Name</Label>
                                <Input
                                    id="cust-name"
                                    placeholder="John Doe"
                                    value={newCustomer.name}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cust-phone">Phone Number</Label>
                                <Input
                                    id="cust-phone"
                                    placeholder="+251..."
                                    value={newCustomer.phone}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cust-debt">Initial Debt (Optional)</Label>
                                <Input
                                    id="cust-debt"
                                    type="number"
                                    placeholder="0.00"
                                    value={newCustomer.debtAmount}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, debtAmount: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddCustomer} disabled={!newCustomer.name}>Create Customer</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="flex-1 overflow-hidden border border-black/10 bg-white shadow-sm">
                <div className="h-full overflow-y-auto">
                    {filteredCustomers.length === 0 ? (
                        <div className="flex h-64 flex-col items-center justify-center text-center text-muted-foreground p-8">
                            <Users className="size-12 mb-4 opacity-20" />
                            <p>No customers found matching your search</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-black/5 hover:bg-transparent">
                                    <TableHead className="text-foreground">Customer</TableHead>
                                    <TableHead className="text-foreground">Contact</TableHead>
                                    <TableHead className="text-foreground text-right">Outstanding Debt</TableHead>
                                    <TableHead className="text-foreground text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCustomers.map((customer) => (
                                    <TableRow key={customer.id} className="border-black/5">
                                        <TableCell className="font-semibold">{customer.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                                <Phone className="size-3" />
                                                {customer.phone || "No phone"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <Badge
                                                    variant={customer.debtAmount > 0 ? "destructive" : (customer.debtAmount < 0 ? "outline" : "secondary")}
                                                    className={`font-mono ${customer.debtAmount < 0 ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : ''}`}
                                                >
                                                    ${Math.abs(customer.debtAmount).toFixed(2)}
                                                </Badge>
                                                <span className={`text-[9px] uppercase font-bold tracking-wider ${customer.debtAmount > 0 ? 'text-red-600' : (customer.debtAmount < 0 ? 'text-green-600' : 'text-zinc-500')}`}>
                                                    {customer.debtAmount > 0 ? 'Owed to Pharmacy' : (customer.debtAmount < 0 ? 'Customer Credit' : 'Balanced')}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedCustomer(customer)
                                                    setDebtDialogOpen(true)
                                                }}
                                                className="border-primary/20 hover:bg-primary/5 text-primary"
                                            >
                                                <CreditCard className="mr-2 size-4" />
                                                Manage Debt
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </Card>

            {/* Manage Debt Dialog */}
            <Dialog open={debtDialogOpen} onOpenChange={setDebtDialogOpen}>
                <DialogContent className="bg-card border-black/20 shadow-lg">
                    <DialogHeader>
                        <DialogTitle>Manage Debt: {selectedCustomer?.name}</DialogTitle>
                        <DialogDescription>
                            Record payments or add to the customer's outstanding balance.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className={`rounded-lg p-4 flex justify-between items-center ${selectedCustomer && selectedCustomer.debtAmount > 0 ? 'bg-red-50/50' : (selectedCustomer && selectedCustomer.debtAmount < 0 ? 'bg-green-50/50' : 'bg-secondary')}`}>
                            <span className="text-sm font-medium">
                                {selectedCustomer && selectedCustomer.debtAmount > 0 ? 'Customer Currently Owes:' : (selectedCustomer && selectedCustomer.debtAmount < 0 ? 'Pharmacy Currently Owes:' : 'Current Balance:')}
                            </span>
                            <span className={`text-lg font-bold font-mono ${selectedCustomer && selectedCustomer.debtAmount > 0 ? 'text-red-700' : (selectedCustomer && selectedCustomer.debtAmount < 0 ? 'text-green-700' : 'text-zinc-500')}`}>
                                ${Math.abs(selectedCustomer?.debtAmount || 0).toFixed(2)}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="payment">Register Payment (Reduces Debt)</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                    <Input
                                        id="payment"
                                        type="number"
                                        placeholder="0.00"
                                        className="pl-7"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="extra">Add New Debt (Increases Debt)</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                    <Input
                                        id="extra"
                                        type="number"
                                        placeholder="0.00"
                                        className="pl-7"
                                        value={additionalDebt}
                                        onChange={(e) => setAdditionalDebt(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDebtDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateDebt} className="bg-primary text-primary-foreground">
                            Confirm Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
