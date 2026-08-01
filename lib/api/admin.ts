import { apiFetch } from "@/lib/api/client"

export type AdminDashboardMetrics = {
  total_users: number
  total_companies: number
  catalog_items: number
  active_rfqs: number
  active_contracts: number
  escrow_balance: number
  open_disputes: number
  monthly_revenue: number
  pending_verifications: number
}

export type AdminActivityType =
  | "registration"
  | "contract"
  | "payment"
  | "dispute"

export type AdminActivityItem = {
  id: string
  type: AdminActivityType
  title: string
  description: string
  happened_at: string
}

export type AdminDashboardResponse = {
  metrics: AdminDashboardMetrics
  recent_activity: AdminActivityItem[]
}

export type AdminUserStatus = "pending" | "active" | "blocked"

export type AdminUserRole =
  | "buyer"
  | "supplier"
  | "both"
  | "admin"
  | "superadmin"
  | "moderator"

export type AdminUser = {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string | null
  role: AdminUserRole
  status: AdminUserStatus
  created_at: string
  updated_at: string
}

export type AdminUserStatusFilter = AdminUserStatus | "all"

export type AdminUserStatusCounts = Record<AdminUserStatusFilter, number>

export type AdminUsersResponse = {
  items: AdminUser[]
  total: number
  page: number
  page_size: number
  pages: number
  status_counts: AdminUserStatusCounts
}

export type AdminUsersParams = {
  page: number
  pageSize: number
  status: AdminUserStatusFilter
  query: string
}

export const adminApi = {
  getDashboard: () => apiFetch<AdminDashboardResponse>("/admin/dashboard"),
  getUsers: ({ page, pageSize, status, query }: AdminUsersParams) => {
    const searchParams = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    })
    if (status !== "all") {
      searchParams.set("status", status)
    }
    if (query.trim()) {
      searchParams.set("query", query.trim())
    }
    return apiFetch<AdminUsersResponse>(`/admin/users?${searchParams.toString()}`)
  },
  updateUserStatus: (userId: number, status: AdminUserStatus) =>
    apiFetch<AdminUser>(`/admin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
}
