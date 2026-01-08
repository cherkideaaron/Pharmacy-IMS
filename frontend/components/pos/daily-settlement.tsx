"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"
import { Banknote, Landmark, ArrowRight, CheckCircle2, AlertCircle, Plus, History, Receipt, Wallet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function DailySettlement() {
    const currentUser = useStore((state) => state.currentUser)
    const sales = useStore((state) => state.sales)
    const deposits = useStore((state) => state.deposits)
    const auditLogs = useStore((state) => state.auditLogs)
    const addDeposit = useStore((state) => state.addDeposit)
    const { toast } = useToast()

    const [amountSubmitted, setAmountSubmitted] = useState<string>("")
    const [notes, setNotes] = useState("")
    const [submissionType, setSubmissionType] = useState<"revenue" | "debt">("revenue")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Calculate today's cash revenue (Sales + Debt Payments)
    const { todayCashSales, todayDebtPayments } = useMemo(() => {
        const today = new Date().toISOString().split('T')[0]

        const salesAmount = sales
            .filter(s =>
                s.employeeId === currentUser?.id &&
                s.timestamp.startsWith(today) &&
                s.paymentMethod === "cash"
            )
            .reduce((sum, s) => sum + s.totalAmount, 0)

        const debtAmount = auditLogs
            .filter(log =>
                log.userId === currentUser?.id &&
                log.timestamp.startsWith(today) &&
                log.action === "debt_updated" &&
                Number((log.metadata as any)?.paymentAmount || 0) > 0
            )
            .reduce((sum, log) => sum + Number((log.metadata as any)?.paymentAmount || 0), 0)

        return { todayCashSales: salesAmount, todayDebtPayments: debtAmount }
    }, [sales, auditLogs, currentUser])

    const todayCashRevenue = todayCashSales + todayDebtPayments

    const handleSubmit = async () => {
        if (!currentUser) return
        if (!amountSubmitted) {
            toast({
                title: "Error",
                description: "Please enter the amount submitted to the bank.",
                variant: "destructive"
            })
            return
        }

        if (!notes || notes.trim().length < 5) {
            return
        }

        setIsSubmitting(true)
        try {
            const finalNotes = `[${submissionType.toUpperCase()}] ${notes.trim()}`
            await addDeposit({
                date: new Date().toISOString().split('T')[0],
                employeeId: currentUser!.id,
                employeeName: currentUser!.name,
                cashRevenue: todayCashRevenue,
                amountSubmitted: Number(amountSubmitted),
                notes: finalNotes
            })
            toast({
                title: "Success",
                description: "Your bank deposit has been recorded."
            })
            setAmountSubmitted("")
            setNotes("")
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to record settlement.",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const todaySubmissions = useMemo(() => {
        const today = new Date().toISOString().split('T')[0]
        return deposits.filter(d => d.employeeId === currentUser?.id && d.date === today)
    }, [deposits, currentUser])

    // Lifetime Balance Calculation (Sales + Debt Payments - Deposits)
    const lifetimeStats = useMemo(() => {
        if (!currentUser) return { expected: 0, submitted: 0, balance: 0 }

        const totalExpectedSales = sales
            .filter(s => s.employeeId === currentUser.id && s.paymentMethod === "cash")
            .reduce((sum, s) => sum + s.totalAmount, 0)

        const totalExpectedDebt = auditLogs
            .filter(log =>
                log.userId === currentUser.id &&
                log.action === "debt_updated" &&
                Number((log.metadata as any)?.paymentAmount || 0) > 0
            )
            .reduce((sum, log) => sum + Number((log.metadata as any)?.paymentAmount || 0), 0)

        const totalSubmitted = deposits
            .filter(d => d.employeeId === currentUser.id)
            .reduce((sum, d) => sum + d.amountSubmitted, 0)

        const totalExpected = totalExpectedSales + totalExpectedDebt

        return {
            expected: totalExpected,
            submitted: totalSubmitted,
            balance: totalSubmitted - totalExpected
        }
    }, [sales, auditLogs, deposits, currentUser])

    const totalSubmittedToday = todaySubmissions.reduce((sum, d) => sum + d.amountSubmitted, 0)
    const currentDiscrepancy = totalSubmittedToday - todayCashRevenue
    const newLifetimeBalance = lifetimeStats.balance + (Number(amountSubmitted) || 0)

    return (
        <div className="flex flex-col gap-6 h-full max-w-5xl mx-auto py-8">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-foreground">Daily Bank Settlement</h2>
                <p className="text-muted-foreground">Record the amount of cash you've submitted to the bank today. Your lifetime balance tracks all shortages and excesses.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="p-6 border-black/10 bg-white shadow-sm flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-zinc-100 p-2 text-zinc-600">
                                <Banknote className="size-5" />
                            </div>
                            <h3 className="font-semibold text-sm">Today's Summary</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <span className="text-xs text-muted-foreground uppercase block">Expected (Cash)</span>
                                <span className="text-2xl font-black font-mono tracking-tighter text-foreground">${todayCashRevenue.toFixed(2)}</span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground uppercase block">Submitted Today</span>
                                <span className="text-xl font-bold font-mono text-primary">${totalSubmittedToday.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className={`p-6 border-black/10 shadow-sm flex flex-col justify-between transition-colors ${lifetimeStats.balance < 0 ? 'bg-red-50/50' : 'bg-green-50/50'}`}>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-zinc-600 text-white p-2">
                                <Landmark className="size-5" />
                            </div>
                            <h3 className="font-bold text-sm">Lifetime Balance</h3>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-tight">Your cumulative shortage or excess across all transaction history.</p>
                    </div>
                    <div className="mt-4">
                        <span className="text-xs text-muted-foreground uppercase block">Balance Standing</span>
                        <span className={`text-4xl font-black font-mono tracking-tighter ${lifetimeStats.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {lifetimeStats.balance >= 0 ? '+' : ''}${lifetimeStats.balance.toFixed(2)}
                        </span>
                        {lifetimeStats.balance < 0 && (
                            <p className="text-[10px] text-red-600 mt-1 font-bold animate-pulse">Missing Cash Reaches across days</p>
                        )}
                    </div>
                </Card>

                <Card className="p-6 border-black/10 bg-white shadow-sm flex flex-col">
                    <div className="space-y-4 flex-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-primary/10 p-2 text-primary">
                                    <Plus className="size-5" />
                                </div>
                                <h3 className="font-semibold text-sm">Add Submission</h3>
                            </div>
                        </div>

                        <div className="flex p-0.5 bg-zinc-100 rounded-lg">
                            <button
                                onClick={() => setSubmissionType("revenue")}
                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${submissionType === "revenue" ? 'bg-white text-primary shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                            >
                                <Receipt className="size-3" />
                                Revenue
                            </button>
                            <button
                                onClick={() => setSubmissionType("debt")}
                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${submissionType === "debt" ? 'bg-white text-blue-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                            >
                                <Wallet className="size-3" />
                                Debt Payments
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="deposit-amount" className="text-xs">Amount Deposited</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-xs">$</span>
                                    <Input
                                        id="deposit-amount"
                                        type="number"
                                        placeholder="0.00"
                                        className="pl-7 font-mono text-lg font-bold h-9"
                                        value={amountSubmitted}
                                        onChange={(e) => setAmountSubmitted(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <Label htmlFor="deposit-notes" className="text-xs">Submission Notes</Label>
                                    <span className="text-[9px] text-muted-foreground uppercase">{notes.length}/5 minimum</span>
                                </div>
                                <textarea
                                    id="deposit-notes"
                                    className={`flex min-h-[50px] w-full rounded-md border bg-background px-3 py-1.5 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors ${notes && notes.trim().length < 5 ? 'border-red-500 bg-red-50/10' : 'border-black/10'}`}
                                    placeholder={submissionType === 'revenue' ? "Explain this revenue drop..." : "Which customer debt was this? e.g. Mr. X paid $400"}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                                {notes && notes.trim().length < 5 && (
                                    <p className="text-[10px] text-red-600 font-medium animate-in fade-in slide-in-from-top-1 px-1">
                                        Note too short. Minimum 5 characters required.
                                    </p>
                                )}
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !amountSubmitted}
                                className="w-full bg-primary text-primary-foreground font-bold shadow-md hover:scale-[1.02] transition-transform"
                            >
                                {isSubmitting ? "Submitting..." : "Submit Deposit"}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div >

            <Card className={`p-6 border-black/10 transition-colors shadow-sm ${newLifetimeBalance < lifetimeStats.balance && amountSubmitted ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Today's Result</p>
                            <p className={`text-xl font-black font-mono ${currentDiscrepancy < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {currentDiscrepancy >= 0 ? '+' : ''}${currentDiscrepancy.toFixed(2)}
                            </p>
                        </div>

                        <ArrowRight className="size-6 text-muted-foreground" />

                        <div className="flex flex-col">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Lifetime Balance</p>
                            <p className={`text-2xl font-black font-mono ${newLifetimeBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {newLifetimeBalance >= 0 ? '+' : ''}${newLifetimeBalance.toFixed(2)}
                            </p>
                        </div>
                    </div>

                </div>

            </Card >

            {
                todaySubmissions.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <History className="size-4" />
                            Today's Submission History
                        </h3>
                        <div className="grid gap-3">
                            {todaySubmissions.map((sub, i) => (
                                <Card key={sub.id} className="p-3 border-black/5 bg-white/50 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Submission #{i + 1}</span>
                                            <span className="text-sm font-semibold">{new Date(sub.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                        {sub.notes && <span className="text-xs italic text-muted-foreground border-l pl-3">"{sub.notes}"</span>}
                                    </div>
                                    <Badge variant="outline" className="font-mono text-primary border-primary/20">
                                        +${sub.amountSubmitted.toFixed(2)}
                                    </Badge>
                                </Card>
                            ))}
                        </div>
                    </div>
                )
            }
        </div >
    )
}
