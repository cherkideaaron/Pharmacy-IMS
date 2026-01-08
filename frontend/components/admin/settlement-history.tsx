"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

import { Landmark, TrendingDown, TrendingUp, Minus, ChevronDown, ChevronUp, FileText, User, Clock } from "lucide-react"
import type { Sale, DailyDeposit, AuditLog } from "@/lib/types"

interface AdminSettlementHistoryProps {
    sales: Sale[]
    deposits: DailyDeposit[]
    auditLogs: AuditLog[]
}

export function AdminSettlementHistory({ sales, deposits, auditLogs }: AdminSettlementHistoryProps) {
    const historyData = useMemo(() => {
        // 1. Get all unique dates from sales, deposits, and audit logs
        const dates = new Set<string>()
        sales.forEach(s => dates.add(s.timestamp.split('T')[0]))
        deposits.forEach(d => dates.add(d.date))
        auditLogs.forEach(l => dates.add(l.timestamp.split('T')[0]))

        // 2. Map data for each date
        return Array.from(dates)
            .sort((a, b) => b.localeCompare(a)) // Newest first
            .map(dateStr => {
                // Expected cash revenue (Sales marked as 'cash')
                const salesExpected = sales
                    .filter(s => s.timestamp.startsWith(dateStr) && s.paymentMethod === "cash")
                    .reduce((sum, s) => sum + s.totalAmount, 0)

                // Debt payments (Audit logs marked as 'debt_updated' with payment)
                const debtExpected = auditLogs
                    .filter(log =>
                        log.timestamp.startsWith(dateStr) &&
                        log.action === "debt_updated" &&
                        ((log.metadata as any)?.paymentAmount || 0) > 0
                    )
                    .reduce((sum, log) => sum + ((log.metadata as any)?.paymentAmount || 0), 0)

                const expected = salesExpected + debtExpected

                // Actual bank submissions
                const dayDeposits = deposits.filter(d => d.date === dateStr)
                const submitted = dayDeposits.reduce((sum, d) => sum + d.amountSubmitted, 0)

                const discrepancy = submitted - expected

                return {
                    date: dateStr,
                    expected,
                    salesExpected,
                    debtExpected,
                    submitted,
                    discrepancy,
                    dayDeposits,
                    submissionsCount: dayDeposits.length
                }
            })
            .filter(item => item.expected > 0 || item.submitted > 0) // Only show days with activity
    }, [sales, deposits, auditLogs])

    return (
        <Card className="flex flex-col overflow-hidden border border-black/10 bg-white shadow-sm">
            <div className="border-b border-black/10 p-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <Landmark className="size-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Settlement History</h3>
                        <p className="text-xs text-muted-foreground">Daily comparison of expected cash vs. bank submissions</p>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <div className="w-full text-sm">
                    <div className="hidden lg:flex w-full items-center border-b border-black/5 bg-zinc-50/50">
                        <div className="flex-1 px-4 py-3 text-left font-bold text-foreground">Date</div>
                        <div className="w-[150px] px-4 py-3 text-right font-bold text-foreground">Expected (Sales)</div>
                        <div className="w-[150px] px-4 py-3 text-right font-bold text-foreground">Submitted (Bank)</div>
                        <div className="w-[120px] px-4 py-3 text-right font-bold text-foreground">Discrepancy</div>
                        <div className="w-[120px] px-4 py-3 text-center font-bold text-foreground">Status</div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {historyData.map((day) => (
                            <Accordion key={day.date} type="single" collapsible className="w-full">
                                <AccordionItem value={day.date} className="border-b border-black/5 last:border-0">
                                    {/* Desktop Row */}
                                    <div className="hidden lg:flex w-full items-center hover:bg-zinc-50 transition-colors bg-white">
                                        <div className="flex-1 px-4 py-2 font-semibold">
                                            <AccordionTrigger className="hover:no-underline py-0 py-4 h-full">
                                                <div className="flex flex-col items-start gap-1">
                                                    <span>
                                                        {new Date(day.date).toLocaleDateString("en-US", {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                    {day.debtExpected > 0 && (
                                                        <Badge variant="outline" className="text-[9px] py-0 px-1 border-blue-200 text-blue-600 bg-blue-50">
                                                            Incl. Debt: ${day.debtExpected.toFixed(2)}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </AccordionTrigger>
                                        </div>
                                        <div className="w-[150px] px-4 py-2 text-right font-mono text-sm">
                                            ${day.expected.toFixed(2)}
                                        </div>
                                        <div className="w-[150px] px-4 py-2 text-right font-mono text-sm text-primary">
                                            <div className="flex flex-col items-end">
                                                <span>${day.submitted.toFixed(2)}</span>
                                                <span className="text-[9px] text-muted-foreground uppercase">{day.submissionsCount} submissions</span>
                                            </div>
                                        </div>
                                        <div className={`w-[120px] px-4 py-2 text-right font-mono font-bold text-sm ${day.discrepancy < 0 ? 'text-red-600' : day.discrepancy > 0 ? 'text-green-600' : 'text-zinc-400'}`}>
                                            {day.discrepancy === 0 ? '$0.00' : (day.discrepancy > 0 ? `+$${day.discrepancy.toFixed(2)}` : `-$${Math.abs(day.discrepancy).toFixed(2)}`)}
                                        </div>
                                        <div className="w-[120px] px-4 py-2 text-center">
                                            {day.discrepancy < 0 ? (
                                                <Badge variant="destructive" className="text-[10px] py-0 px-2">
                                                    Shortage
                                                </Badge>
                                            ) : day.discrepancy > 0 ? (
                                                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 text-[10px] py-0 px-2 border-0">
                                                    Excess
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-[10px] py-0 px-2 border-black/10">
                                                    Balanced
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Mobile/Tablet Card Row */}
                                    <div className="lg:hidden w-full hover:bg-zinc-50 transition-colors bg-white">
                                        <AccordionTrigger className="hover:no-underline px-4 py-4 w-full">
                                            <div className="flex flex-col w-full gap-3">
                                                <div className="flex items-center justify-between w-full">
                                                    <span className="font-semibold">
                                                        {new Date(day.date).toLocaleDateString("en-US", {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                    <div>
                                                        {day.discrepancy < 0 ? (
                                                            <Badge variant="destructive" className="text-[10px] py-0 px-2">
                                                                Shortage
                                                            </Badge>
                                                        ) : day.discrepancy > 0 ? (
                                                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 text-[10px] py-0 px-2 border-0">
                                                                Excess
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-[10px] py-0 px-2 border-black/10">
                                                                Balanced
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 text-sm w-full">
                                                    <div className="flex flex-col items-start">
                                                        <span className="text-[10px] text-muted-foreground uppercase">Expected</span>
                                                        <span className="font-mono">${day.expected.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] text-muted-foreground uppercase">Submitted</span>
                                                        <span className="font-mono text-primary">${day.submitted.toFixed(2)}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between w-full pt-2 border-t border-dashed border-black/10 text-xs">
                                                    <span className="text-muted-foreground">Discrepancy</span>
                                                    <span className={`font-mono font-bold ${day.discrepancy < 0 ? 'text-red-600' : day.discrepancy > 0 ? 'text-green-600' : 'text-zinc-400'}`}>
                                                        {day.discrepancy === 0 ? '$0.00' : (day.discrepancy > 0 ? `+$${day.discrepancy.toFixed(2)}` : `-$${Math.abs(day.discrepancy).toFixed(2)}`)}
                                                    </span>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                    </div>
                                    <AccordionContent className="bg-zinc-50/50 px-6 py-4 border-t border-black/5">
                                        <div className="space-y-3">
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2">Individual Submissions</p>
                                            {day.dayDeposits.map((dep, idx) => (
                                                <div key={dep.id} className="bg-white p-3 rounded-lg border border-black/5 shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-zinc-100 rounded-full p-1.5">
                                                                <User className="size-3 text-zinc-500" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold leading-none">{dep.employeeName}</p>
                                                                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground">
                                                                    <Clock className="size-2.5" />
                                                                    <span>{new Date(dep.createdAt).toLocaleTimeString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Badge variant="secondary" className="font-mono text-xs">
                                                            +${dep.amountSubmitted.toFixed(2)}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-start gap-2 bg-zinc-50 p-2 rounded border border-zinc-100">
                                                        <FileText className="size-3 text-zinc-400 mt-0.5" />
                                                        <p className="text-[11px] text-zinc-600 leading-relaxed italic">
                                                            {dep.notes || "No note provided"}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="mt-4 pt-3 border-t border-black/5 grid grid-cols-2 gap-4">
                                                <div className="bg-white/50 p-2 rounded border border-black/5">
                                                    <span className="text-[9px] uppercase font-bold text-muted-foreground block">Cash Sales</span>
                                                    <span className="text-sm font-mono font-bold">${day.salesExpected.toFixed(2)}</span>
                                                </div>
                                                <div className="bg-white/50 p-2 rounded border border-black/5">
                                                    <span className="text-[9px] uppercase font-bold text-muted-foreground block">Debt Payments</span>
                                                    <span className="text-sm font-mono font-bold text-blue-600">${day.debtExpected.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        ))}
                        {historyData.length === 0 && (
                            <div className="py-12 text-center text-muted-foreground">
                                No settlement data available yet
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </Card >
    )
}
