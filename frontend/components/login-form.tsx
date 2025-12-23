"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { Lock, Mail, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const login = useStore((state) => state.login)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await login(email, password)

      if (user) {
        if (user.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/pos")
        }
      } else {
        // Check the store for the specific error
        const error = useStore.getState().error
        toast({
          title: "Login failed",
          description: error || "Invalid email or password",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Login error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-border bg-card p-8">
      <div className="mb-8 space-y-2">
        <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">PharmaSys</h1>
        <p className="text-sm text-muted-foreground">Enterprise Inventory Management</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-secondary border-border text-foreground"
              placeholder="user@pharmacy.com"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 bg-secondary border-border text-foreground"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
        </div>

        <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-8 rounded-md bg-secondary/50 p-4 text-xs text-muted-foreground">
        <p className="mb-2 font-semibold text-foreground">Note:</p>
        <p>Ensure you have created a user in Supabase Authentication and added a matching record in the 'users' table.</p>
      </div>
    </Card>
  )
}

