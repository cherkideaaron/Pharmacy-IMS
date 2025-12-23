"use client"

import { useCallback } from "react"

type ToastVariant = "default" | "destructive"

export interface ToastOptions {
  title?: string
  description?: string
  variant?: ToastVariant
}

// Minimal toast hook to avoid missing module errors. In a real app this would
// render a toast UI; here we log to the console and optionally show alert in dev.
export function useToast() {
  const toast = useCallback(({ title, description, variant }: ToastOptions) => {
    const message = [title, description].filter(Boolean).join(": ")
    if (typeof window !== "undefined") {
      console[variant === "destructive" ? "error" : "info"](message || "Notification")
    }
  }, [])

  return { toast }
}

