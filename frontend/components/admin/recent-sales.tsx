"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Sale } from "@/lib/types"
import { Clock } from "lucide-react"

interface RecentSalesProps {
  sales: Sale[]
}

export function RecentSales({ sales }: RecentSalesProps) {
  const recentSales = sales
    .slice(0, 10)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Card className="border-border bg-card">
      <div className="border-b border-border p-6">
        <h2 className="text-lg font-semibold text-foreground">Recent Sales</h2>
        <p className="text-sm text-muted-foreground">Latest transactions from all terminals</p>
      </div>
      <div className="p-6">
        {recentSales.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p className="text-sm">No sales recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-start justify-between rounded-lg bg-secondary p-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{sale.productName}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {sale.quantity}x
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{sale.employeeName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    <span>{formatTime(sale.timestamp)}</span>
                    <span>·</span>
                    <span className="capitalize">{sale.paymentMethod}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold text-foreground">${sale.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
