import { apiFetch } from "./client"

export type BuyerNavCounts = {
  rfqs: number
  deals: number
  messages: number
  approvals: number
}

export type SupplierNavCounts = {
  rfqs: number
  deals: number
  messages: number
  catalog: number
}

export type AdminNavCounts = {
  companies: number
  moderation: number
  support: number
  chats: number
  disputes: number
  finance: number
}

export type NavCountsRole = "buyer" | "supplier" | "admin"

export type NavCountsForRole<R extends NavCountsRole> = R extends "buyer"
  ? BuyerNavCounts
  : R extends "supplier"
    ? SupplierNavCounts
    : AdminNavCounts

const PATH: Record<NavCountsRole, string> = {
  buyer: "/buyer/nav-counts",
  supplier: "/supplier/nav-counts",
  admin: "/admin/nav-counts",
}

export const navCountsApi = {
  get: <R extends NavCountsRole>(role: R) =>
    apiFetch<NavCountsForRole<R>>(PATH[role]),
}
