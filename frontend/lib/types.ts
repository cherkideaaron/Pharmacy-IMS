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
  countryOrigin?: string
  description?: string
  requiresPrescription: boolean
  status: "active" | "archived"
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
  paymentMethod: "cash" | "card" | "mobile banking"
  prescriptionNumber?: string
  notes?: string
  customerId?: string
  customerName?: string
}

export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: "sale" | "stock_adjustment" | "product_added" | "product_updated" | "login" | "logout" | "customer_added" | "debt_updated"
  details: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface Customer {
  id: string
  name: string
  phone: string
  debtAmount: number
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  totalSalesToday: number
  totalRevenue: number
  lowStockItems: number
  expiringItems: number
  salesCount: number
}

export interface DailyDeposit {
  id: string
  date: string
  employeeId: string
  employeeName: string
  cashRevenue: number
  amountSubmitted: number
  notes?: string
  createdAt: string
}
