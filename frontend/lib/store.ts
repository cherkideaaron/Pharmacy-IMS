"use client"

import { create } from "zustand"
import { supabase } from "./supabase"
import type { User, Product, Sale, AuditLog } from "./types"

interface AppState {
  // Auth
  currentUser: User | null
  isLoading: boolean
  error: string | null
  setCurrentUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<User | null>
  logout: () => Promise<void>

  // Data Fetching
  fetchProducts: () => Promise<void>
  fetchSales: () => Promise<void>
  fetchAuditLogs: () => Promise<void>
  fetchCustomers: () => Promise<void>
  fetchDeposits: () => Promise<void>

  // Products
  products: Product[]
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>

  deleteProduct: (id: string) => Promise<void>
  updateStock: (id: string, quantity: number) => Promise<void>

  // Sales
  sales: Sale[]
  addSale: (sale: Omit<Sale, "id" | "timestamp">) => Promise<void>

  // Audit logs
  auditLogs: AuditLog[]
  addAuditLog: (log: Omit<AuditLog, "id" | "timestamp">) => Promise<void>

  // Customers
  customers: import("./types").Customer[]
  addCustomer: (customer: Omit<import("./types").Customer, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateCustomerDebt: (id: string, newDebt: number, paymentAmount: number) => Promise<void>

  // Deposits
  deposits: import("./types").DailyDeposit[]
  addDeposit: (deposit: Omit<import("./types").DailyDeposit, "id" | "createdAt">) => Promise<void>
}

export const useStore = create<AppState>((set, get) => ({
  // Initial State
  currentUser: null,
  isLoading: false,
  error: null,
  products: [],
  sales: [],
  auditLogs: [],
  customers: [],
  deposits: [],

  // Auth
  setCurrentUser: (user) => set({ currentUser: user }),

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (user) {
        // Fetch user profile from users table
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("email", email)
          .single()

        if (profileError || !userProfile) {
          // Fallback if user just created in Auth but not in table (shouldn't happen with proper flow)
          throw new Error("User profile not found")
        }

        const appUser: User = {
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name,
          role: userProfile.role,
          password: "", // Not needed/available
          createdAt: userProfile.created_at,
        }

        set({ currentUser: appUser })

        // Log login
        await get().addAuditLog({
          userId: appUser.id,
          userName: appUser.name,
          action: "login",
          details: `${appUser.name} logged in`,
        })

        return appUser
      }
      return null
    } catch (error: any) {
      set({ error: error.message })
      return null
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    const user = get().currentUser
    if (user) {
      await get().addAuditLog({
        userId: user.id,
        userName: user.name,
        action: "logout",
        details: `${user.name} logged out`,
      })
    }
    await supabase.auth.signOut()
    set({ currentUser: null, products: [], sales: [], auditLogs: [] })
  },

  // Data Fetching
  fetchProducts: async () => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .neq("status", "archived") // Filter out archived products
      .order("name")

    if (!error && data) {
      // Map database columns to camelCase if needed, but currently they match mostly
      // or we rely on JS handling snake_case from DB if we didn't map it.
      // Ideally we map snake_case from DB to camelCase for frontend
      const mappedProducts: Product[] = data.map(p => ({
        id: p.id,
        name: p.name,
        genericName: p.generic_name,
        manufacturer: p.manufacturer,
        category: p.category,
        dosageForm: p.dosage_form,
        strength: p.strength,
        barcode: p.barcode,
        sku: p.sku,
        unitPrice: p.unit_price,
        costPrice: p.cost_price,
        wholesalePrice: p.wholesale_price,
        stock: p.stock,
        reorderLevel: p.reorder_level,
        expiryDate: p.expiry_date,
        batchNumber: p.batch_number,
        location: p.location,
        requiresPrescription: p.requires_prescription,
        status: p.status,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }))
      set({ products: mappedProducts })
    }
    set({ isLoading: false })
  },

  fetchSales: async () => {
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(100)

    if (!error && data) {
      const mappedSales: Sale[] = data.map(s => ({
        id: s.id,
        productId: s.product_id,
        productName: s.product_name,
        quantity: s.quantity,
        unitPrice: s.unit_price,
        totalAmount: s.total_amount,
        employeeId: s.employee_id,
        employeeName: s.employee_name,
        timestamp: s.timestamp,
        paymentMethod: s.payment_method,
        prescriptionNumber: s.prescription_number,
        notes: s.notes
      }))
      set({ sales: mappedSales })
    }
  },

  fetchAuditLogs: async () => {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(100)

    if (!error && data) {
      const mappedLogs: AuditLog[] = data.map(l => ({
        id: l.id,
        userId: l.user_id,
        userName: l.user_name,
        action: l.action,
        details: l.details,
        timestamp: l.timestamp,
        metadata: l.metadata
      }))
      set({ auditLogs: mappedLogs })
    }
  },

  fetchCustomers: async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("name")

    if (!error && data) {
      const mappedCustomers: import("./types").Customer[] = data.map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone || "",
        debtAmount: c.debt_amount,
        createdAt: c.created_at,
        updatedAt: c.updated_at
      }))
      set({ customers: mappedCustomers })
    }
  },

  fetchDeposits: async () => {
    const { data, error } = await supabase
      .from("daily_deposits")
      .select("*")
      .order("date", { ascending: false })

    if (!error && data) {
      const mappedDeposits: import("./types").DailyDeposit[] = data.map(d => ({
        id: d.id,
        date: d.date,
        employeeId: d.employee_id,
        employeeName: d.employee_name,
        cashRevenue: d.cash_revenue,
        amountSubmitted: d.amount_submitted,
        notes: d.notes,
        createdAt: d.created_at
      }))
      set({ deposits: mappedDeposits })
    }
  },

  // Products Actions
  addProduct: async (product) => {
    const dbProduct = {
      name: product.name,
      generic_name: product.genericName,
      manufacturer: product.manufacturer,
      category: product.category,
      dosage_form: product.dosageForm,
      strength: product.strength,
      barcode: product.barcode,
      sku: product.sku,
      unit_price: product.unitPrice,
      cost_price: product.costPrice,
      wholesale_price: product.wholesalePrice,
      stock: product.stock,
      reorder_level: product.reorderLevel,
      expiry_date: product.expiryDate,
      batch_number: product.batchNumber,
      location: product.location,
      requires_prescription: product.requiresPrescription
    }

    const { error } = await supabase.from("products").insert(dbProduct)

    if (error) {
      set({ error: error.message })
      throw error
    }

    await get().fetchProducts()
  },

  updateProduct: async (id, updates) => {
    // Map updates to snake_case
    const dbUpdates: any = {}
    if (updates.name) dbUpdates.name = updates.name
    if (updates.genericName) dbUpdates.generic_name = updates.genericName
    if (updates.manufacturer) dbUpdates.manufacturer = updates.manufacturer
    if (updates.category) dbUpdates.category = updates.category
    if (updates.dosageForm) dbUpdates.dosage_form = updates.dosageForm
    if (updates.strength) dbUpdates.strength = updates.strength
    if (updates.barcode) dbUpdates.barcode = updates.barcode
    if (updates.sku) dbUpdates.sku = updates.sku
    if (updates.unitPrice) dbUpdates.unit_price = updates.unitPrice
    if (updates.costPrice) dbUpdates.cost_price = updates.costPrice
    if (updates.wholesalePrice) dbUpdates.wholesale_price = updates.wholesalePrice
    if (updates.stock) dbUpdates.stock = updates.stock
    if (updates.reorderLevel) dbUpdates.reorder_level = updates.reorderLevel
    if (updates.expiryDate) dbUpdates.expiry_date = updates.expiryDate
    if (updates.batchNumber) dbUpdates.batch_number = updates.batchNumber
    if (updates.location) dbUpdates.location = updates.location
    if (updates.requiresPrescription !== undefined) dbUpdates.requires_prescription = updates.requiresPrescription

    const { error } = await supabase.from("products").update(dbUpdates).eq("id", id)

    if (error) {
      set({ error: error.message })
      throw error
    }

    await get().fetchProducts()
  },

  updateStock: async (id, quantity) => {
    // Rely on database trigger. Just refresh data.
    await get().fetchProducts()
  },

  // Sales Actions
  addSale: async (sale) => {
    const dbSale = {
      product_id: sale.productId,
      product_name: sale.productName,
      quantity: sale.quantity,
      unit_price: sale.unitPrice,
      total_amount: sale.totalAmount,
      employee_id: sale.employeeId,
      employee_name: sale.employeeName,
      payment_method: sale.paymentMethod,
      prescription_number: sale.prescriptionNumber,
      notes: sale.notes
    }

    const { error } = await supabase.from("sales").insert(dbSale)

    if (error) {
      set({ error: error.message })
      throw error
    }

    // Manual stock update removed - relying on 'reduce_stock_on_sale' trigger
    // which is now working due to RLS fix.

    await get().fetchSales()
    await get().fetchProducts() // To get updated stock
  },

  deleteProduct: async (id: string) => {
    // Perform soft delete by updating status to 'archived'
    const { error } = await supabase
      .from("products")
      .update({ status: "archived" })
      .eq("id", id)

    if (error) {
      set({ error: error.message })
      throw error
    }

    // Refresh the products list
    await get().fetchProducts()
  },

  // Audit Log Actions
  addAuditLog: async (log) => {
    const dbLog = {
      user_id: log.userId,
      user_name: log.userName,
      action: log.action,
      details: log.details,
      metadata: log.metadata
    }

    await supabase.from("audit_logs").insert(dbLog)
    await get().fetchAuditLogs()
  },

  // Customer Actions
  addCustomer: async (customer) => {
    const user = get().currentUser
    const { data, error } = await supabase.from("customers").insert({
      name: customer.name,
      phone: customer.phone,
      debt_amount: customer.debtAmount
    }).select().single()

    if (error) {
      set({ error: error.message })
      throw error
    }

    if (user) {
      await get().addAuditLog({
        userId: user.id,
        userName: user.name,
        action: "customer_added",
        details: `Added new customer: ${customer.name}`
      })
    }

    await get().fetchCustomers()
  },

  updateCustomerDebt: async (id, newDebt, paymentAmount) => {
    const user = get().currentUser
    const customer = get().customers.find(c => c.id === id)
    if (!customer) return

    const { error } = await supabase
      .from("customers")
      .update({ debt_amount: newDebt })
      .eq("id", id)

    if (error) {
      set({ error: error.message })
      throw error
    }

    if (user) {
      const detail = paymentAmount > 0
        ? `Customer ${customer.name} paid $${paymentAmount.toFixed(2)}. New debt: $${newDebt.toFixed(2)}`
        : `Updated debt for ${customer.name} to $${newDebt.toFixed(2)}`

      await get().addAuditLog({
        userId: user.id,
        userName: user.name,
        action: "debt_updated",
        details: detail,
        metadata: { customerId: id, oldDebt: customer.debtAmount, newDebt, paymentAmount }
      })
    }

    await get().fetchCustomers()
  },

  addDeposit: async (deposit) => {
    const dbDeposit = {
      date: deposit.date,
      employee_id: deposit.employeeId,
      employee_name: deposit.employeeName,
      cash_revenue: deposit.cashRevenue,
      amount_submitted: deposit.amountSubmitted,
      notes: deposit.notes
    }

    const { error } = await supabase.from("daily_deposits").insert(dbDeposit)

    if (error) {
      set({ error: error.message })
      throw error
    }

    await get().fetchDeposits()
  }
}))
