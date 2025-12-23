// Database schema types for the pharmacy inventory system

export type UserRole = "admin" | "employee"

export interface User {
  id: string
  email: string
  password: string // In production, this would be hashed
  name: string
  role: UserRole
  createdAt: string
}

export interface Product {
  id: string
  name: string
  genericName: string
  manufacturer: string
  category: string
  dosageForm: string
  strength: string
  barcode: string
  sku: string
  unitPrice: number
  costPrice: number
  wholesalePrice: number
  stock: number
  reorderLevel: number
  expiryDate: string
  batchNumber: string
  location: string
  requiresPrescription: boolean
  createdAt: string
  updatedAt: string
}

export interface Sale {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalAmount: number
  employeeId: string
  employeeName: string
  timestamp: string
  paymentMethod: "cash" | "card" | "insurance"
  prescriptionNumber?: string
}

export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: "sale" | "stock_adjustment" | "product_added" | "product_updated" | "login" | "logout"
  details: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface DashboardStats {
  totalSalesToday: number
  totalRevenue: number
  lowStockItems: number
  expiringItems: number
  salesCount: number
}
