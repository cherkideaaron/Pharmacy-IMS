"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Wholesaler } from "@/lib/types"
import { Search, Edit, Trash2, Plus, Phone, Mail, MapPin } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"

interface WholesalerTableProps {
    wholesalers: Wholesaler[]
    onEdit: (wholesaler: Wholesaler) => void
    onDelete: (wholesaler: Wholesaler) => void
    onAdd: () => void
}

export function WholesalerTable({ wholesalers, onEdit, onDelete, onAdd }: WholesalerTableProps) {
    const [search, setSearch] = useState("")
    const [itemToDelete, setItemToDelete] = useState<Wholesaler | null>(null)

    const filteredWholesalers = wholesalers.filter((w) =>
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        (w.contactPerson && w.contactPerson.toLowerCase().includes(search.toLowerCase())) ||
        (w.phone && w.phone.includes(search))
    )

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search wholesalers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-secondary border-border text-foreground"
                    />
                </div>
                <Button onClick={onAdd} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="mr-2 size-4" />
                    Add Wholesaler
                </Button>
            </div>

            {/* Desktop Table */}
            <div className="hidden rounded-lg border border-border bg-card lg:block">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-foreground">Name</TableHead>
                            <TableHead className="text-foreground">Contact</TableHead>
                            <TableHead className="text-foreground">Address</TableHead>
                            <TableHead className="text-foreground">Balance</TableHead>
                            <TableHead className="text-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredWholesalers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No wholesalers found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredWholesalers.map((wholesaler) => (
                                <TableRow key={wholesaler.id} className="border-border hover:bg-secondary/50">
                                    <TableCell>
                                        <div className="font-medium text-foreground">{wholesaler.name}</div>
                                        {wholesaler.contactPerson && (
                                            <div className="text-xs text-muted-foreground">Contact: {wholesaler.contactPerson}</div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1 text-sm">
                                            {wholesaler.phone && (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Phone className="size-3" />
                                                    <span>{wholesaler.phone}</span>
                                                </div>
                                            )}
                                            {wholesaler.email && (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Mail className="size-3" />
                                                    <span>{wholesaler.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                        {wholesaler.address}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={wholesaler.balance > 0 ? "destructive" : wholesaler.balance < 0 ? "secondary" : "outline"}
                                            className={wholesaler.balance < 0 ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200" : ""}
                                        >
                                            ${Math.abs(wholesaler.balance).toFixed(2)} {wholesaler.balance > 0 ? "Debt" : wholesaler.balance < 0 ? "Credit" : ""}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onEdit(wholesaler)}
                                                className="text-foreground hover:bg-primary hover:text-primary-foreground"
                                            >
                                                <Edit className="size-4" />
                                                <span className="sr-only">Edit</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setItemToDelete(wholesaler)}
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
            <div className="grid gap-4 md:grid-cols-2 lg:hidden">
                {filteredWholesalers.length === 0 ? (
                    <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
                        No wholesalers found
                    </div>
                ) : (
                    filteredWholesalers.map((wholesaler) => (
                        <div key={wholesaler.id} className="rounded-lg border border-border bg-card p-4">
                            <div className="mb-4 flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-foreground">{wholesaler.name}</h3>
                                    {wholesaler.contactPerson && (
                                        <p className="text-xs text-muted-foreground">{wholesaler.contactPerson}</p>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => onEdit(wholesaler)} className="h-8 w-8">
                                        <Edit className="size-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setItemToDelete(wholesaler)} className="h-8 w-8 text-destructive hover:text-destructive">
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Balance</span>
                                    <Badge
                                        variant={wholesaler.balance > 0 ? "destructive" : wholesaler.balance < 0 ? "secondary" : "outline"}
                                        className={wholesaler.balance < 0 ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200" : ""}
                                    >
                                        ${Math.abs(wholesaler.balance).toFixed(2)} {wholesaler.balance > 0 ? "Debt" : wholesaler.balance < 0 ? "Credit" : ""}
                                    </Badge>
                                </div>

                                {(wholesaler.phone || wholesaler.email) && (
                                    <div className="space-y-1 pt-2 border-t border-border">
                                        {wholesaler.phone && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Phone className="size-3" />
                                                <span>{wholesaler.phone}</span>
                                            </div>
                                        )}
                                        {wholesaler.email && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Mail className="size-3" />
                                                <span>{wholesaler.email}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {wholesaler.address && (
                                    <div className="flex items-start gap-2 pt-2 border-t border-border text-muted-foreground">
                                        <MapPin className="size-3 mt-0.5" />
                                        <span className="text-xs">{wholesaler.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AlertDialog open={!!itemToDelete} onOpenChange={(open: boolean) => !open && setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {itemToDelete?.name} and all associated records. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                if (itemToDelete) {
                                    onDelete(itemToDelete)
                                    setItemToDelete(null)
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
